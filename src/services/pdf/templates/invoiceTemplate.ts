import { ServiceOrderWithDetails } from '@models/ServiceOrder';
import { User } from '@domain/entities/User';
import { formatCurrency } from '@core/utils/formatCurrency';
import { formatDate, formatDateTime } from '@core/utils/formatDate';
import { PAYMENT_METHOD_LABELS } from '@core/constants';

interface InvoiceData {
  order: ServiceOrderWithDetails;
  shop: User;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  vehicleName: string;
  licensePlate: string;
}

export function generateInvoiceHTML(data: InvoiceData): string {
  const { order, shop, customerName, customerPhone, customerAddress, vehicleName, licensePlate } = data;

  const laborRows = order.laborItems
    .map(
      (item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${item.description}</td>
        <td class="right">${formatCurrency(item.total)}</td>
      </tr>
    `
    )
    .join('');

  const partsRows = order.spareParts
    .map(
      (part, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${part.partName}${part.partNumber ? ` (${part.partNumber})` : ''}</td>
        <td class="center">${part.quantity}</td>
        <td class="right">${formatCurrency(part.unitPrice)}</td>
        <td class="right">${formatCurrency(part.total)}</td>
      </tr>
    `
    )
    .join('');

  const paymentRows = order.payments
    .map(
      (payment) => `
      <tr>
        <td>${formatDate(payment.date)}</td>
        <td>${payment.paymentType === 'advance' ? 'Advance' : 'Final Payment'}</td>
        <td>${PAYMENT_METHOD_LABELS[payment.paymentMethod]}</td>
        <td class="right">${formatCurrency(payment.amount)}</td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice - ${order.id}</title>
      <style>
        @page {
          margin: 40px;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        html, body {
          height: 100%;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 12px;
          line-height: 1.5;
          color: #333;
          padding: 0;
          display: flex;
          flex-direction: column;
        }
        .content {
          flex: 1;
        }
        .header {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid #6366F1;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .shop-info h1 {
          color: #6366F1;
          font-size: 24px;
          margin-bottom: 5px;
        }
        .shop-info p {
          color: #666;
          font-size: 11px;
        }
        .invoice-info {
          text-align: right;
        }
        .invoice-info h2 {
          color: #6366F1;
          font-size: 18px;
        }
        .invoice-info p {
          font-size: 11px;
          color: #666;
        }
        .info-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 20px;
        }
        .info-box {
          flex: 1;
          background: #f5f5f5;
          padding: 12px;
          border-radius: 8px;
        }
        .info-box h3 {
          font-size: 10px;
          text-transform: uppercase;
          color: #999;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }
        .info-box p {
          font-size: 12px;
          margin-bottom: 3px;
        }
        .info-box .primary {
          font-weight: 600;
          font-size: 14px;
          color: #6366F1;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th {
          background: #6366F1;
          color: white;
          padding: 10px 8px;
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
        }
        td {
          padding: 10px 8px;
          border-bottom: 1px solid #eee;
          font-size: 12px;
        }
        .center { text-align: center; }
        .right { text-align: right; }
        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin: 20px 0 10px;
          padding-bottom: 5px;
          border-bottom: 1px solid #ddd;
        }
        .summary-table {
          width: 300px;
          margin-left: auto;
        }
        .summary-table td {
          padding: 8px;
        }
        .summary-table .label {
          color: #666;
        }
        .summary-table .total-row td {
          font-size: 16px;
          font-weight: 700;
          border-top: 2px solid #6366F1;
          color: #6366F1;
        }
        .summary-table .balance-row td {
          font-size: 14px;
          font-weight: 600;
          color: ${order.balanceDue > 0 ? '#D32F2F' : '#2E7D32'};
        }
        .footer {
          margin-top: auto;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          color: #999;
          font-size: 10px;
        }
      </style>
    </head>
    <body>
      <div class="content">
      <div class="header">
        <div class="shop-info">
          <h1>${shop.shopName || 'Mechanic Shop'}</h1>
          <p>${shop.shopPhone || ''}</p>
          <p>${shop.shopAddress || ''}</p>
        </div>
        <div class="invoice-info">
          <h2>INVOICE</h2>
          <p><strong>Invoice #:</strong> ${order.id.slice(0, 8).toUpperCase()}</p>
          <p><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div class="info-section">
        <div class="info-box">
          <h3>Customer Details</h3>
          <p class="primary">${customerName}</p>
          <p>${customerPhone}</p>
          ${customerAddress ? `<p>${customerAddress}</p>` : ''}
        </div>
        <div class="info-box">
          <h3>Vehicle Details</h3>
          <p class="primary">${vehicleName}</p>
          <p>${licensePlate}</p>
          ${order.kmReading ? `<p>Odometer: ${order.kmReading.toLocaleString()} km</p>` : ''}
        </div>
      </div>

      ${order.description ? `
        <div class="info-box" style="margin-bottom: 20px;">
          <h3>Service Description</h3>
          <p>${order.description}</p>
        </div>
      ` : ''}

      ${order.laborItems.length > 0 ? `
        <h3 class="section-title">Labor Charges</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 40px">#</th>
              <th>Description</th>
              <th class="right" style="width: 100px">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${laborRows}
          </tbody>
        </table>
      ` : ''}

      ${order.spareParts.length > 0 ? `
        <h3 class="section-title">Spare Parts</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 40px">#</th>
              <th>Part Name</th>
              <th class="center" style="width: 60px">Qty</th>
              <th class="right" style="width: 100px">Unit Price</th>
              <th class="right" style="width: 100px">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${partsRows}
          </tbody>
        </table>
      ` : ''}

      <table class="summary-table">
        <tr>
          <td class="label">Labor Total:</td>
          <td class="right">${formatCurrency(order.totalLabor)}</td>
        </tr>
        <tr>
          <td class="label">Parts Total:</td>
          <td class="right">${formatCurrency(order.totalParts)}</td>
        </tr>
        <tr class="total-row">
          <td>Grand Total:</td>
          <td class="right">${formatCurrency(order.totalAmount)}</td>
        </tr>
        <tr>
          <td class="label">Paid:</td>
          <td class="right" style="color: #2E7D32;">- ${formatCurrency(order.totalPaid)}</td>
        </tr>
        <tr class="balance-row">
          <td>Balance Due:</td>
          <td class="right">${formatCurrency(order.balanceDue)}</td>
        </tr>
      </table>

      ${order.payments.length > 0 ? `
        <h3 class="section-title">Payment History</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Method</th>
              <th class="right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${paymentRows}
          </tbody>
        </table>
      ` : ''}
      </div>

      <div class="footer">
        <p>Thank you for your business!</p>
        <p>Generated on ${formatDateTime(new Date())} | ${shop.shopName || 'Mechanic Shop'}</p>
      </div>
    </body>
    </html>
  `;
}
