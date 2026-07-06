import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import axios from 'axios';
import { config } from '../config.js';
import { prisma } from '../db/prisma.js';

// Multi-bulto v0.24.0: carga el pack plan del pedido y devuelve un Map
// { orderItemId → bagNumber } listo para pasar al drawAlbaran. Devuelve un
// Map vacío si no hay plan (single-bulto o pedido pre-v0.24.0).
async function loadPlanByItem(orderId) {
  const assignments = await prisma.orderItemBagAssignment.findMany({
    where: { orderId },
    select: { orderItemId: true, bagNumber: true },
  });
  return new Map(assignments.map((a) => [a.orderItemId, a.bagNumber]));
}

// QR encodea una URL navegable. Al escanear desde la cámara del móvil abre el
// navegador en `/scan/<wpOrderId>` directamente. El parser del backend acepta
// también el formato legacy `WMS:<id>` para albaranes ya impresos.
//
// Multi-bulto: cuando totalBags > 1, cada página del albarán trae un QR con
// `?bag=X` distinto. Así el conductor sabe qué bulto está confirmando al
// escanear cualquier bolsa/caja sin tenerlas todas a la vista al mismo
// tiempo. Single-bulto (totalBags=1) mantiene el QR simple sin query, para
// no romper albaranes ya impresos.
function buildQrPayload(order, opts = {}) {
  const base = (config.frontendOrigin || 'https://wms.chimuelo.cl').replace(/\/$/, '');
  const { bagNumber, totalBags } = opts;
  if (totalBags && totalBags > 1 && bagNumber) {
    return `${base}/scan/${order.wpOrderId}?bag=${bagNumber}`;
  }
  return `${base}/scan/${order.wpOrderId}`;
}

// Trae la imagen como Buffer. PDFKit solo soporta JPEG y PNG, así que pedimos
// explícitamente esos formatos y descartamos WebP/AVIF (que muchos plugins de
// optimización de WP sirven por defecto). Timeout largo por Cloudflare.
async function fetchImageBuffer(url) {
  if (!url) return null;
  try {
    const res = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 8000,
      headers: {
        Accept: 'image/jpeg, image/png, image/*;q=0.8',
        'User-Agent': 'WMS-Albaran-PDF/1.0',
      },
    });
    const ct = (res.headers['content-type'] || '').toLowerCase();
    if (ct.includes('webp') || ct.includes('avif') || ct.includes('svg')) {
      console.warn('[pdf] formato no soportado por pdfkit:', ct, url);
      return null;
    }
    // Validación de firma binaria: PNG = 89 50 4E 47, JPEG = FF D8 FF
    const buf = Buffer.from(res.data);
    const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
    const isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    if (!isPng && !isJpeg) {
      console.warn('[pdf] buffer no es PNG/JPEG (content-type:', ct, ') url:', url);
      return null;
    }
    return buf;
  } catch (err) {
    console.warn('[pdf] image fetch failed:', url, err.message);
    return null;
  }
}

// Helper: dibuja UN albarán completo en el documento actual (sin pipe, sin end).
// Útil para reusarlo tanto en el endpoint single como en el batch.
// opts.bagNumber / opts.totalBags pintan la franja "BULTO X DE N" arriba.
async function drawAlbaran(doc, order, opts = {}) {
  // QR — para multi-bulto incluye ?bag=X para que el scan identifique al
  // toque qué bulto se está registrando. En single-bulto es un QR simple.
  const qrPng = await QRCode.toBuffer(
    buildQrPayload(order, { bagNumber: opts.bagNumber, totalBags: opts.totalBags }),
    { errorCorrectionLevel: 'M', margin: 1, width: 220 },
  );

  // Pre-fetch thumbnails (delegado al caller en el batch para no duplicar).
  let itemImages = opts.itemImages;
  if (!itemImages) {
    itemImages = new Map();
    const urls = [...new Set(order.items.map((i) => i.product?.thumbnailUrl).filter(Boolean))];
    const buffers = await Promise.all(urls.map(fetchImageBuffer));
    urls.forEach((url, idx) => {
      if (buffers[idx]) itemImages.set(url, buffers[idx]);
    });
  }

  // Franja "BULTO X DE N" arriba (solo si N > 1). Identifica físicamente
  // cada bolsa de un pedido multi-bulto sin necesidad de escritura manual.
  // No usamos emojis: la fuente Helvetica de pdfkit no soporta glifos fuera
  // del BMP y se ven como basura ("Ø=Üæ").
  const totalBags = opts.totalBags ?? 1;
  const bagNumber = opts.bagNumber ?? 1;
  if (totalBags > 1) {
    doc.save();
    doc.rect(40, 30, 515, 30).fill('#1d4ed8');
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(18)
      .text(`BULTO ${bagNumber} DE ${totalBags}`, 40, 36, { width: 515, align: 'center' });
    doc.restore();
  }
  const headerYOffset = totalBags > 1 ? 40 : 0;

  // Header
  doc.font('Helvetica-Bold').fontSize(20).fillColor('#0f172a').text('Albarán de pedido', 40, 40 + headerYOffset);
  doc.font('Helvetica').fontSize(11).fillColor('#475569')
    .text(`Pedido #${order.number}`, 40, 70 + headerYOffset)
    .text(`Fecha: ${new Date().toLocaleString('es-CL')}`, 40, 86 + headerYOffset);

  // Si el pedido tiene ruta asignada al momento de imprimir, la mostramos en
  // pill azul. Si no la tiene, NO imprimimos nada — la ruta puede asignarse
  // antes o después de la impresión, y "Sin ruta asignada" en el papel
  // confunde. El operador de clasificación verá la ruta actualizada cuando
  // escanee el QR del albarán empacado.
  if (order.route) {
    const routeText = `RUTA ${order.route}${order.stopPosition ? ` · PARADA ${order.stopPosition}` : ''}`;
    const padX = 10;
    const padY = 6;
    doc.font('Helvetica-Bold').fontSize(14);
    const textW = doc.widthOfString(routeText);
    const textH = doc.currentLineHeight();
    const pillW = textW + padX * 2;
    const pillH = textH + padY * 2;
    doc.save();
    doc.roundedRect(40, 106 + headerYOffset, pillW, pillH, 6).fill('#1d4ed8');
    doc.fillColor('#ffffff').text(routeText, 40 + padX, 106 + padY + headerYOffset);
    doc.restore();
  }

  doc.image(qrPng, 410, 35 + headerYOffset, { width: 140, height: 140 });
  doc.font('Helvetica').fontSize(8).fillColor('#94a3b8')
    .text('Escanea para empacar / ver pedido', 410, 180 + headerYOffset, { width: 140, align: 'center' });

  // Sección Cliente: nombre + dirección + depto (si tiene) + comuna + teléfono.
  // Cada campo va en su propia línea con label en negrita para que el repartidor
  // los ubique a un golpe de vista. Si un campo está vacío se omite (no
  // imprimimos "—" en cada línea, ensucia el papel).
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(12).text('Cliente', 40, 158 + headerYOffset);
  let custY = 176 + headerYOffset;
  const labelColor = '#475569';
  const valueColor = '#0f172a';
  const colW = 360; // dejamos espacio para el QR a la derecha

  // Nombre del cliente (siempre se imprime). Después del text(), pdfkit
  // setea doc.y al final del texto escrito — lo usamos para no solaparnos
  // si el nombre se rompe en varias líneas.
  doc.font('Helvetica-Bold').fontSize(11).fillColor(valueColor)
    .text(order.customerName || '—', 40, custY, { width: colW });
  custY = doc.y + 4;

  function drawCustomerLine(label, value) {
    if (!value) return;
    doc.font('Helvetica-Bold').fontSize(9).fillColor(labelColor)
      .text(`${label}: `, 40, custY, { continued: true, width: colW })
      .font('Helvetica').fontSize(10).fillColor(valueColor)
      .text(String(value), { width: colW });
    // Usamos doc.y (no un +14 fijo) para respetar saltos de línea cuando
    // la dirección es larga y wraps en 2-3 líneas. Si no, el campo
    // siguiente (Comuna / Teléfono) tapa el final de la dirección.
    custY = doc.y + 2;
  }

  // Dirección + depto en la misma línea ("Av. Siempre Viva 742 · Depto 12A")
  const addrParts = [order.customerAddress, order.customerAddress2].filter((s) => s && String(s).trim());
  drawCustomerLine('Dirección', addrParts.join(' · ') || null);
  drawCustomerLine('Comuna', order.customerCity);
  drawCustomerLine('Teléfono', order.customerPhone);

  // Si bajamos mucho con los campos de cliente, arrancamos el cursor abajo.
  let cursorY = Math.max(230 + headerYOffset, custY + 6);

  if (order.shippingMethod) {
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#0f172a')
      .text('Envío: ', 40, cursorY, { continued: true })
      .font('Helvetica').fillColor('#1d4ed8').text(order.shippingMethod);
    cursorY += 22;
  }

  // Nota del cliente (si tiene). Caja ámbar para que el picker / repartidor
  // la vea sí o sí al mirar el papel.
  if (order.customerNote && order.customerNote.trim()) {
    const noteText = order.customerNote.trim();
    const noteHeight = Math.max(40, Math.ceil(noteText.length / 90) * 14 + 30);
    doc.save();
    doc.rect(40, cursorY, 515, noteHeight).fill('#fffbeb').stroke('#fbbf24');
    doc.fillColor('#92400e').font('Helvetica-Bold').fontSize(9)
      .text('NOTA DEL CLIENTE', 50, cursorY + 8);
    doc.fillColor('#451a03').font('Helvetica').fontSize(10)
      .text(noteText, 50, cursorY + 22, { width: 495 });
    doc.restore();
    cursorY += noteHeight + 8;
  }

  if (order.hasB2Pending) {
    doc.save();
    doc.rect(40, cursorY, 515, 60).fill('#fef3c7');
    doc.fillColor('#92400e').font('Helvetica-Bold').fontSize(20)
      .text('B2 - EL SOL PENDIENTE', 40, cursorY + 14, { width: 515, align: 'center' });
    doc.fillColor('#92400e').font('Helvetica').fontSize(10)
      .text('Revisar al cargar y al entregar — items a sacar del cargamento a granel', 40, cursorY + 40, { width: 515, align: 'center' });
    doc.restore();
    cursorY += 80;
  }

  if (order.allowPartialDelivery) {
    doc.save();
    doc.rect(40, cursorY, 515, 50).fill('#d1fae5');
    doc.fillColor('#065f46').font('Helvetica-Bold').fontSize(14)
      .text('ENTREGA PARCIAL APROBADA', 40, cursorY + 10, { width: 515, align: 'center' });
    const note = order.partialDeliveryNote || 'Cliente acepta recibir aunque falten items B2 al momento de la entrega.';
    doc.fillColor('#065f46').font('Helvetica').fontSize(9)
      .text(note, 50, cursorY + 30, { width: 495, align: 'center' });
    doc.restore();
    cursorY += 60;
  }

  // Multi-bulto con pack plan (v0.24.0): si se pasó bagNumber Y el pedido
  // tiene un plan, filtramos los items B1 al bulto correspondiente. Los B2
  // van completos abajo en todas las páginas (siguen siendo a granel).
  const planByItem = opts.planByItem; // Map<orderItemId, bagNumber> | undefined

  const b1Header = planByItem && bagNumber && totalBags > 1
    ? `Contenido del bulto ${bagNumber}`
    : 'Contenido de la bolsa';
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(12).text(b1Header, 40, cursorY);
  cursorY += 20;

  const allB1 = order.items.filter((i) => i.warehouse === 'B1');
  const b1Items = planByItem && bagNumber
    ? allB1.filter((it) => planByItem.get(it.id) === bagNumber)
    : allB1;
  drawTable(doc, b1Items, cursorY, itemImages);
  cursorY = doc.y + 10;

  const b2Items = order.items.filter((i) => i.warehouse === 'B2');
  if (b2Items.length > 0) {
    cursorY += 10;
    doc.fillColor('#b45309').font('Helvetica-Bold').fontSize(12)
      .text('Sacar del cargamento a granel (B2 - El Sol):', 40, cursorY);
    cursorY += 20;
    drawTable(doc, b2Items, cursorY, itemImages, '#fffbeb');
  }
}

// Genera un PDF con los albaranes de TODAS las pedidos pasados, uno por página.
// Útil para imprimir en batch al armar una secuencia (los pickers escanean
// el QR de cada albarán para empezar a empacar).
export async function renderSequenceAlbaranesPdf(orders, stream) {
  const doc = new PDFDocument({ size: 'A4', margin: 40, autoFirstPage: false });
  doc.pipe(stream);

  // Pre-fetch UNA vez todos los thumbnails de todos los pedidos.
  const allUrls = new Set();
  for (const o of orders) {
    for (const it of o.items || []) {
      if (it.product?.thumbnailUrl) allUrls.add(it.product.thumbnailUrl);
    }
  }
  const urlList = [...allUrls];
  const buffers = await Promise.all(urlList.map(fetchImageBuffer));
  const itemImages = new Map();
  urlList.forEach((url, idx) => {
    if (buffers[idx]) itemImages.set(url, buffers[idx]);
  });

  for (const order of orders) {
    const totalBags = Math.max(1, order.bagsExpected ?? 1);
    const planByItem = totalBags > 1 ? await loadPlanByItem(order.id) : new Map();
    for (let i = 1; i <= totalBags; i += 1) {
      doc.addPage();
      await drawAlbaran(doc, order, {
        itemImages, bagNumber: i, totalBags,
        planByItem: planByItem.size > 0 ? planByItem : undefined,
      });
    }
  }

  doc.end();
}

export async function renderAlbaranPdf(order, stream, opts = {}) {
  // Cantidad de bultos a imprimir: prioridad al override (?bags=N) y, si no,
  // el bagsExpected guardado en el pedido. Default 1 (compat).
  const totalBags = Math.max(1, opts.bagsOverride ?? order.bagsExpected ?? 1);

  const doc = new PDFDocument({ size: 'A4', margin: 40, autoFirstPage: false });
  doc.pipe(stream);

  // Pre-fetch imágenes una vez (mismo conjunto para las N páginas).
  const itemImages = new Map();
  const urls = [...new Set((order.items || []).map((i) => i.product?.thumbnailUrl).filter(Boolean))];
  const buffers = await Promise.all(urls.map(fetchImageBuffer));
  urls.forEach((url, idx) => {
    if (buffers[idx]) itemImages.set(url, buffers[idx]);
  });

  // Multi-bulto con plan: filtramos items por bulto para que cada página
  // muestre solo lo que va en ese bulto.
  const planByItem = totalBags > 1 ? await loadPlanByItem(order.id) : new Map();
  for (let i = 1; i <= totalBags; i += 1) {
    doc.addPage();
    await drawAlbaran(doc, order, {
      itemImages, bagNumber: i, totalBags,
      planByItem: planByItem.size > 0 ? planByItem : undefined,
    });
  }

  doc.end();
}

function drawTable(doc, items, startY, itemImages, rowBg = null) {
  const x = 40;
  const w = 515;
  const rowH = 36;
  const imgSize = 30;
  const colImgX = x + 4;
  const colSkuX = x + 44;
  const colNameX = x + 140;
  const colQtyX = x + w - 60;

  // Header
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#475569');
  doc.text('Foto', colImgX, startY + 4, { width: 36 });
  doc.text('SKU', colSkuX, startY + 4, { width: 90 });
  doc.text('Producto', colNameX, startY + 4, { width: 260 });
  doc.text('Cant.', colQtyX, startY + 4, { width: 50, align: 'right' });
  doc.moveTo(x, startY + 20).lineTo(x + w, startY + 20).strokeColor('#e2e8f0').stroke();

  let y = startY + 24;
  doc.font('Helvetica').fontSize(10).fillColor('#0f172a');
  for (const it of items) {
    if (rowBg) {
      doc.save();
      doc.rect(x, y - 2, w, rowH).fill(rowBg);
      doc.restore();
      doc.fillColor('#0f172a');
    }

    // Thumbnail (si está disponible)
    const thumbUrl = it.product?.thumbnailUrl;
    if (thumbUrl && itemImages.has(thumbUrl)) {
      try {
        doc.image(itemImages.get(thumbUrl), colImgX, y, { fit: [imgSize, imgSize] });
      } catch {
        // formato no soportado por pdfkit, lo saltamos silenciosamente
      }
    } else {
      // Caja gris vacía para mantener alineación
      doc.save();
      doc.rect(colImgX, y, imgSize, imgSize).fillAndStroke('#f1f5f9', '#e2e8f0');
      doc.restore();
      doc.fillColor('#0f172a');
    }

    const textY = y + 10;
    doc.text(it.product?.sku || '—', colSkuX, textY, { width: 90 });
    // lineName = nombre tal cual vino del line_item de WC (incluye variante,
    // ej "Heno Oxbow - 425Gr Banana"). Si no existe caemos al name del producto.
    doc.text(it.lineName || it.product?.name || '—', colNameX, textY, { width: 260 });
    doc.font('Helvetica-Bold').text(String(it.qty), colQtyX, textY, { width: 50, align: 'right' });
    doc.font('Helvetica');
    y += rowH;
  }
  doc.y = y;
}
