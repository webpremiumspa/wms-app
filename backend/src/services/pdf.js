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

export async function renderAlbaranPdf(order, stream) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  doc.pipe(stream);

  // QR
  const qrPng = await QRCode.toBuffer(buildQrPayload(order), {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 220,
  });

  // Pre-fetch thumbnails en paralelo (con tope de concurrencia).
  const itemImages = new Map();
  const urls = [...new Set(order.items.map((i) => i.product?.thumbnailUrl).filter(Boolean))];
  const buffers = await Promise.all(urls.map(fetchImageBuffer));
  urls.forEach((url, idx) => {
    if (buffers[idx]) itemImages.set(url, buffers[idx]);
  });

  // Header
  doc.font('Helvetica-Bold').fontSize(20).text('Albarán de pedido', 40, 40);
  doc.font('Helvetica').fontSize(11).fillColor('#475569')
    .text(`Pedido #${order.number}`, 40, 70)
    .text(`Fecha: ${new Date().toLocaleString('es-CL')}`, 40, 86)
    .text(`Ruta: ${order.route || '—'}${order.stopPosition ? `  ·  Parada ${order.stopPosition}` : ''}`, 40, 102);

  // QR arriba a la derecha
  doc.image(qrPng, 410, 35, { width: 140, height: 140 });
  doc.font('Helvetica').fontSize(8).fillColor('#94a3b8')
    .text('Escanea para ver pedido', 410, 180, { width: 140, align: 'center' });

  // Cliente
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(12).text('Cliente', 40, 150);
  doc.font('Helvetica').fontSize(11).fillColor('#0f172a')
    .text(order.customerName || '—', 40, 168)
    .fillColor('#475569').text(order.customerAddress || '', 40, 184);

  let cursorY = 230;

  // Marca destacada Bodega 2 (optimización #6)
  if (order.hasB2Pending) {
    doc.save();
    doc.rect(40, cursorY, 515, 60).fill('#fef3c7');
    doc.fillColor('#92400e').font('Helvetica-Bold').fontSize(20)
      .text('⚠ BODEGA 2 PENDIENTE', 40, cursorY + 14, { width: 515, align: 'center' });
    doc.fillColor('#92400e').font('Helvetica').fontSize(10)
      .text('Revisar al cargar y al entregar — items a sacar del cargamento a granel', 40, cursorY + 40, { width: 515, align: 'center' });
    doc.restore();
    cursorY += 80;
  }

  // Tabla de items B1 (los que van EN la bolsa)
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(12).text('Contenido de la bolsa', 40, cursorY);
  cursorY += 20;

  const b1Items = order.items.filter((i) => i.warehouse === 'B1');
  drawTable(doc, b1Items, cursorY, itemImages);
  cursorY = doc.y + 10;

  // Listado de items B2 (los que NO van en la bolsa, se entregan a granel)
  const b2Items = order.items.filter((i) => i.warehouse === 'B2');
  if (b2Items.length > 0) {
    cursorY += 10;
    doc.fillColor('#b45309').font('Helvetica-Bold').fontSize(12)
      .text('Sacar del cargamento a granel (Bodega 2):', 40, cursorY);
    cursorY += 20;
    drawTable(doc, b2Items, cursorY, itemImages, '#fffbeb');
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
    doc.text(it.product?.name || '—', colNameX, textY, { width: 260 });
    doc.font('Helvetica-Bold').text(String(it.qty), colQtyX, textY, { width: 50, align: 'right' });
    doc.font('Helvetica');
    y += rowH;
  }
  doc.y = y;
}
