import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import axios from 'axios';
import { config } from '../config.js';

// QR encodea una URL navegable. Al escanear desde la cámara del móvil abre el
// navegador en `/scan/<wpOrderId>` directamente. El parser del backend acepta
// también el formato legacy `WMS:<id>` para albaranes ya impresos.
function buildQrPayload(order) {
  const base = (config.frontendOrigin || 'https://wms.chimuelo.cl').replace(/\/$/, '');
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
async function drawAlbaran(doc, order, opts = {}) {
  // QR
  const qrPng = await QRCode.toBuffer(buildQrPayload(order), {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 220,
  });

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

  // Header
  doc.font('Helvetica-Bold').fontSize(20).fillColor('#0f172a').text('Albarán de pedido', 40, 40);
  doc.font('Helvetica').fontSize(11).fillColor('#475569')
    .text(`Pedido #${order.number}`, 40, 70)
    .text(`Fecha: ${new Date().toLocaleString('es-CL')}`, 40, 86);

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
    doc.roundedRect(40, 106, pillW, pillH, 6).fill('#1d4ed8');
    doc.fillColor('#ffffff').text(routeText, 40 + padX, 106 + padY);
    doc.restore();
  }

  doc.image(qrPng, 410, 35, { width: 140, height: 140 });
  doc.font('Helvetica').fontSize(8).fillColor('#94a3b8')
    .text('Escanea para empacar / ver pedido', 410, 180, { width: 140, align: 'center' });

  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(12).text('Cliente', 40, 158);
  doc.font('Helvetica').fontSize(11).fillColor('#0f172a')
    .text(order.customerName || '—', 40, 176)
    .fillColor('#475569').text(order.customerAddress || '', 40, 192);

  let cursorY = 230;

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
      .text('⚠ B2 - EL SOL PENDIENTE', 40, cursorY + 14, { width: 515, align: 'center' });
    doc.fillColor('#92400e').font('Helvetica').fontSize(10)
      .text('Revisar al cargar y al entregar — items a sacar del cargamento a granel', 40, cursorY + 40, { width: 515, align: 'center' });
    doc.restore();
    cursorY += 80;
  }

  if (order.allowPartialDelivery) {
    doc.save();
    doc.rect(40, cursorY, 515, 50).fill('#d1fae5');
    doc.fillColor('#065f46').font('Helvetica-Bold').fontSize(14)
      .text('✓ ENTREGA PARCIAL APROBADA', 40, cursorY + 10, { width: 515, align: 'center' });
    const note = order.partialDeliveryNote || 'Cliente acepta recibir aunque falten items B2 al momento de la entrega.';
    doc.fillColor('#065f46').font('Helvetica').fontSize(9)
      .text(note, 50, cursorY + 30, { width: 495, align: 'center' });
    doc.restore();
    cursorY += 60;
  }

  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(12).text('Contenido de la bolsa', 40, cursorY);
  cursorY += 20;

  const b1Items = order.items.filter((i) => i.warehouse === 'B1');
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
    doc.addPage();
    await drawAlbaran(doc, order, { itemImages });
  }

  doc.end();
}

export async function renderAlbaranPdf(order, stream) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  doc.pipe(stream);
  await drawAlbaran(doc, order);
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
    doc.text(it.product?.name || '—', colNameX, textY, { width: 260 });
    doc.font('Helvetica-Bold').text(String(it.qty), colQtyX, textY, { width: 50, align: 'right' });
    doc.font('Helvetica');
    y += rowH;
  }
  doc.y = y;
}
