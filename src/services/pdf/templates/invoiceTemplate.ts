import { ServiceOrderWithDetails } from '@domain/entities/ServiceOrder';
import { User } from '@domain/entities/User';
import { formatCurrency } from '@core/utils/formatCurrency';
import { formatDate, formatDateTime } from '@core/utils/formatDate';
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@core/constants';

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
        <td class="center">${item.hours} hrs</td>
        <td class="right">${formatCurrency(item.ratePerHour)}</td>
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
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 12px;
          line-height: 1.5;
          color: #333;
          padding: 20px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid #1976D2;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .shop-info h1 {
          color: #1976D2;
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
          color: #1976D2;
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
          color: #1976D2;
        }
        .status-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-pending { background: #FFF3E0; color: #E65100; }
        .status-in_progress { background: #E3F2FD; color: #1565C0; }
        .status-completed { background: #E8F5E9; color: #2E7D32; }
        .status-cancelled { background: #FAFAFA; color: #757575; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th {
          background: #1976D2;
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
          border-top: 2px solid #1976D2;
          color: #1976D2;
        }
        .summary-table .balance-row td {
          font-size: 14px;
          font-weight: 600;
          color: ${order.balanceDue > 0 ? '#D32F2F' : '#2E7D32'};
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          color: #999;
          font-size: 10px;
        }
        .notes {
          background: #FFF8E1;
          padding: 12px;
          border-radius: 8px;
          margin-top: 20px;
          border-left: 4px solid #FFC107;
        }
        .notes h4 {
          font-size: 11px;
          color: #F57C00;
          margin-bottom: 5px;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
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
          <p><strong>Status:</strong> <span class="status-badge status-${order.status}">${ORDER_STATUS_LABELS[order.status]}</span></p>
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
              <th class="center" style="width: 80px">Hours</th>
              <th class="right" style="width: 100px">Rate</th>
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

      ${order.notes ? `
        <div class="notes">
          <h4>Notes</h4>
          <p>${order.notes}</p>
        </div>
      ` : ''}

      <div class="footer">
        <p>Thank you for your business!</p>
        <p>Generated on ${formatDateTime(new Date())} | ${shop.shopName || 'Mechanic Shop'}</p>
      </div>
    </body>
    </html>
  `;
}
