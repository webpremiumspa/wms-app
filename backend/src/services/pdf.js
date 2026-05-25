import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

// Encodea el pedido en el QR como "WMS:<wpOrderId>" para que el escáner del
// módulo de despacho lo reconozca como nuestro y no como cualquier QR de WC.
function buildQrPayload(order) {
  return `WMS:${order.wpOrderId}`;
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

  // Header
  doc.font('Helvetica-Bold').fontSize(20).text('Albarán de pedido', 40, 40);
  doc.font('Helvetica').fontSize(11).fillColor('#475569')
    .text(`Pedido #${order.number}`, 40, 70)
    .text(`Fecha: ${new Date().toLocaleString('es-CL')}`, 40, 86)
    .text(`Ruta: ${order.route || '—'}${order.stopPosition ? `  ·  Parada ${order.stopPosition}` : ''}`, 40, 102);

  // QR arriba a la derecha
  doc.image(qrPng, 410, 35, { width: 140, height: 140 });
  doc.font('Helvetica').fontSize(9).fillColor('#475569')
    .text(`QR: ${buildQrPayload(order)}`, 410, 180, { width: 140, align: 'center' });

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
  drawTable(doc, b1Items, cursorY);
  cursorY = doc.y + 10;

  // Listado de items B2 (los que NO van en la bolsa, se entregan a granel)
  const b2Items = order.items.filter((i) => i.warehouse === 'B2');
  if (b2Items.length > 0) {
    cursorY += 10;
    doc.fillColor('#b45309').font('Helvetica-Bold').fontSize(12)
      .text('Sacar del cargamento a granel (Bodega 2):', 40, cursorY);
    cursorY += 20;
    drawTable(doc, b2Items, cursorY, '#fffbeb');
  }

  doc.end();
}

function drawTable(doc, items, startY, rowBg = null) {
  const x = 40;
  const w = 515;
  const colQtyX = x + w - 60;

  // Header
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#475569');
  doc.text('SKU', x + 6, startY + 4, { width: 90 });
  doc.text('Producto', x + 100, startY + 4, { width: 300 });
  doc.text('Cant.', colQtyX, startY + 4, { width: 50, align: 'right' });
  doc.moveTo(x, startY + 20).lineTo(x + w, startY + 20).strokeColor('#e2e8f0').stroke();

  let y = startY + 24;
  doc.font('Helvetica').fontSize(10).fillColor('#0f172a');
  for (const it of items) {
    if (rowBg) {
      doc.save();
      doc.rect(x, y - 4, w, 22).fill(rowBg);
      doc.restore();
      doc.fillColor('#0f172a');
    }
    doc.text(it.product?.sku || '—', x + 6, y, { width: 90 });
    doc.text(it.product?.name || '—', x + 100, y, { width: 300 });
    doc.text(String(it.qty), colQtyX, y, { width: 50, align: 'right' });
    y += 22;
  }
  doc.y = y;
}
