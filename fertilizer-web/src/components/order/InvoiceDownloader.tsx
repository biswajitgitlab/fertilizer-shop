import React from 'react';
import { Order } from '../../types';
import { Download, FileText } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export const InvoiceDownloader: React.FC<{ order: Order }> = ({ order }) => {
  const handleDownload = () => {
    const windowPrint = window.open('', '', 'width=800,height=900');
    if (!windowPrint) {
      toast.error("Popup blocked. Please allow popups to download invoice.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tax Invoice - ${order.id}</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 40px; color: #1e293b; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 900; color: #065f46; }
          .title { font-size: 20px; font-weight: 700; text-align: right; }
          .details { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px; }
          table { w-full; width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 13px; }
          th { background-color: #f8fafc; font-weight: 700; }
          .total-box { margin-left: auto; width: 300px; font-size: 14px; }
          .total-row { display: flex; justify-content: space-between; padding: 6px 0; }
          .grand-total { font-weight: 900; font-size: 18px; color: #065f46; border-top: 2px solid #e2e8f0; pt: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">SarkarFertilizer</div>
            <div>Certified Agriculture Store</div>
            <div>Govt. License: HYR-2026-9041</div>
          </div>
          <div class="title">
            TAX INVOICE
            <div style="font-size: 12px; font-weight: 400; color: #64748b;">Order #: ${order.id}</div>
            <div style="font-size: 12px; font-weight: 400; color: #64748b;">Date: ${formatDate(order.createdAt)}</div>
          </div>
        </div>

        <div class="details">
          <div>
            <strong>Billed To:</strong><br/>
            ${order.shippingAddress?.name || order.customerName || 'Valued Customer'}<br/>
            ${order.shippingAddress?.line1 || 'N/A'}${order.shippingAddress?.line2 ? `, ${order.shippingAddress.line2}` : ''}<br/>
            ${[order.shippingAddress?.city, order.shippingAddress?.state].filter(Boolean).join(', ')}${order.shippingAddress?.pincode ? ` - ${order.shippingAddress.pincode}` : ''}<br/>
            Phone: ${order.shippingAddress?.phone || order.phone || 'N/A'}
          </div>
          <div style="text-align: right;">
            <strong>Payment Method:</strong> ${order.paymentMethod}<br/>
            <strong>Status:</strong> ${order.paymentStatus}<br/>
            <strong>Tracking No:</strong> ${order.trackingNumber || 'N/A'}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item Description</th>
              <th>Unit</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(i => `
              <tr>
                <td>${i.product.name}</td>
                <td>${i.product.unit}</td>
                <td>${i.quantity}</td>
                <td>₹${i.product.price}</td>
                <td>₹${i.product.price * i.quantity}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-box">
          <div class="total-row"><span>Subtotal:</span> <span>₹${order.subtotal}</span></div>
          <div class="total-row"><span>Discount:</span> <span>-₹${order.discount}</span></div>
          <div class="total-row"><span>Shipping:</span> <span>₹${order.shippingFee}</span></div>
          <div class="total-row"><span>GST (18%):</span> <span>₹${order.tax}</span></div>
          <div class="total-row grand-total"><span>Grand Total:</span> <span>₹${order.total}</span></div>
        </div>

        <script>window.onload = function() { window.print(); window.close(); }</script>
      </body>
      </html>
    `;

    windowPrint.document.write(htmlContent);
    windowPrint.document.close();
  };

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
    >
      <Download className="w-4 h-4 text-emerald-400" />
      <span>Download PDF Tax Invoice</span>
    </button>
  );
};
