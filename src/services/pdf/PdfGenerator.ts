import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { ServiceOrderWithDetails } from '@models/ServiceOrder';
import { User } from '@domain/entities/User';
import { generateInvoiceHTML } from './templates/invoiceTemplate';

export interface InvoiceGenerationParams {
  order: ServiceOrderWithDetails;
  shop: User;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  vehicleName: string;
  licensePlate: string;
}

export interface OrderSummaryParams {
  orders: ServiceOrderWithDetails[];
  shop: User;
  startDate: Date;
  endDate: Date;
}

class PdfGeneratorService {
  private static instance: PdfGeneratorService;

  private constructor() {}

  public static getInstance(): PdfGeneratorService {
    if (!PdfGeneratorService.instance) {
      PdfGeneratorService.instance = new PdfGeneratorService();
    }
    return PdfGeneratorService.instance;
  }

  /**
   * Generate and print/preview an invoice PDF
   */
  async generateInvoice(params: InvoiceGenerationParams): Promise<void> {
    const html = generateInvoiceHTML(params);
    await Print.printAsync({ html });
  }

  /**
   * Generate an invoice PDF file and return the URI
   */
  async generateInvoiceFile(params: InvoiceGenerationParams): Promise<string> {
    const html = generateInvoiceHTML(params);
    const { uri } = await Print.printToFileAsync({ html });

    return uri;
  }

  /**
   * Generate and share an invoice PDF
   */
  async shareInvoice(params: InvoiceGenerationParams): Promise<void> {
    const uri = await this.generateInvoiceFile(params);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Invoice for Order #${params.order.id.slice(0, 8)}`,
        UTI: 'com.adobe.pdf',
      });
    } else {
      throw new Error('Sharing is not available on this device');
    }
  }

  /**
   * Generate an order summary report for a date range
   */
  async generateOrderSummary(params: OrderSummaryParams): Promise<string> {
    const { orders, shop, startDate, endDate } = params;

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalCollected = orders.reduce((sum, o) => sum + o.totalPaid, 0);
    const totalPending = totalRevenue - totalCollected;
    const completedOrders = orders.filter(o => o.status === 'completed').length;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: sans-serif; padding: 20px; font-size: 12px; }
          h1 { color: #6366F1; font-size: 20px; }
          .summary-box { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .stat { display: inline-block; width: 23%; text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #6366F1; }
          .stat-label { font-size: 10px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #6366F1; color: white; padding: 10px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #eee; }
          .right { text-align: right; }
        </style>
      </head>
      <body>
        <h1>${shop.shopName || 'Mechanic Shop'} - Order Summary</h1>
        <p>Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</p>

        <div class="summary-box">
          <div class="stat">
            <div class="stat-value">${orders.length}</div>
            <div class="stat-label">Total Orders</div>
          </div>
          <div class="stat">
            <div class="stat-value">${completedOrders}</div>
            <div class="stat-label">Completed</div>
          </div>
          <div class="stat">
            <div class="stat-value">₹${(totalRevenue / 1000).toFixed(1)}K</div>
            <div class="stat-label">Total Revenue</div>
          </div>
          <div class="stat">
            <div class="stat-value">₹${(totalCollected / 1000).toFixed(1)}K</div>
            <div class="stat-label">Collected</div>
          </div>
        </div>

        <table>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Vehicle</th>
            <th>Status</th>
            <th class="right">Amount</th>
            <th class="right">Paid</th>
          </tr>
          ${orders.map(order => `
            <tr>
              <td>${order.id.slice(0, 8)}</td>
              <td>${new Date(order.createdAt).toLocaleDateString()}</td>
              <td>${order.vehicleId}</td>
              <td>${order.status}</td>
              <td class="right">₹${order.totalAmount.toLocaleString()}</td>
              <td class="right">₹${order.totalPaid.toLocaleString()}</td>
            </tr>
          `).join('')}
        </table>

        <p style="margin-top: 30px; color: #999; font-size: 10px; text-align: center;">
          Generated on ${new Date().toLocaleString()}
        </p>
      </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    return uri;
  }

  /**
   * Share an order summary report
   */
  async shareOrderSummary(params: OrderSummaryParams): Promise<void> {
    const uri = await this.generateOrderSummary(params);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Order Summary Report',
      });
    }
  }
}

export const pdfGenerator = PdfGeneratorService.getInstance();
export default pdfGenerator;
