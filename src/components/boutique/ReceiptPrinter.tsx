import React from 'react';
import { Printer, Download, Share2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
}

interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface LoyaltyCustomer {
  loyalty_customer_id: number;
  name: string;
  tier: string;
  membership_number: string;
}

interface ReceiptData {
  invoice_number: string;
  sale_date: string;
  boutique_name: string;
  cashier_name: string;
  items: CartItem[];
  subtotal: number;
  discount_amount: number;
  loyalty_discount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  change_amount: number;
  payment_method: string;
  customer?: LoyaltyCustomer;
  loyalty_points_used: number;
  loyalty_points_earned: number;
}

interface ReceiptPrinterProps {
  receiptData: ReceiptData;
  onPrint?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

const ReceiptPrinter: React.FC<ReceiptPrinterProps> = ({
  receiptData,
  onPrint,
  onDownload,
  onShare
}) => {
  const { t, language } = useLanguage();

  const printReceipt = () => {
    const receiptWindow = window.open('', '_blank');
    if (receiptWindow) {
      receiptWindow.document.write(generateReceiptHTML());
      receiptWindow.document.close();
      receiptWindow.print();
      if (onPrint) onPrint();
    }
  };

  const downloadReceipt = () => {
    const receiptHTML = generateReceiptHTML();
    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${receiptData.invoice_number}.html`;
    link.click();
    URL.revokeObjectURL(url);
    if (onDownload) onDownload();
  };

  const shareReceipt = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${t('receipt.title')} - ${receiptData.invoice_number}`,
          text: generateReceiptText(),
        });
        if (onShare) onShare();
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      const receiptText = generateReceiptText();
      await navigator.clipboard.writeText(receiptText);
      alert(t('receipt.copiedToClipboard'));
      if (onShare) onShare();
    }
  };

  const generateReceiptHTML = (): string => {
    return `
<!DOCTYPE html>
<html dir="${language === 'ar' ? 'rtl' : 'ltr'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t('receipt.title')} - ${receiptData.invoice_number}</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            width: 300px;
            margin: 0 auto;
            padding: 10px;
            font-size: 12px;
            line-height: 1.4;
            background: white;
            color: black;
        }
        .center { text-align: center; }
        .right { text-align: right; }
        .left { text-align: left; }
        .bold { font-weight: bold; }
        .header {
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
        }
        .footer {
            border-top: 2px solid #000;
            padding-top: 10px;
            margin-top: 10px;
        }
        .line-item {
            display: flex;
            justify-content: space-between;
            margin: 2px 0;
        }
        .divider {
            border-bottom: 1px dashed #000;
            margin: 5px 0;
        }
        .total-line {
            border-top: 1px solid #000;
            padding-top: 5px;
            font-weight: bold;
        }
        @media print {
            body { width: auto; }
        }
    </style>
</head>
<body>
    <div class="header center">
        <div class="bold" style="font-size: 16px;">${receiptData.boutique_name}</div>
        <div>${t('receipt.invoice')} #${receiptData.invoice_number}</div>
        <div>${new Date(receiptData.sale_date).toLocaleString(language === 'ar' ? 'ar-KW' : 'en-US')}</div>
        <div>${t('receipt.cashier')}: ${receiptData.cashier_name}</div>
    </div>

    ${receiptData.customer ? `
    <div class="customer-info">
        <div class="bold">${t('receipt.customer')}: ${receiptData.customer.name}</div>
        <div>${t('receipt.membership')}: ${receiptData.customer.membership_number}</div>
        <div>${t('receipt.tier')}: ${receiptData.customer.tier}</div>
    </div>
    <div class="divider"></div>
    ` : ''}

    <div class="items">
        ${receiptData.items.map(item => `
        <div class="line-item">
            <div>
                <div class="bold">${item.product.name}</div>
                <div>${item.quantity} x ${item.unit_price.toFixed(3)}</div>
            </div>
            <div class="right">${item.line_total.toFixed(3)}</div>
        </div>
        `).join('')}
    </div>

    <div class="divider"></div>

    <div class="totals">
        <div class="line-item">
            <span>${t('receipt.subtotal')}</span>
            <span>${receiptData.subtotal.toFixed(3)} ${t('common.currency')}</span>
        </div>
        ${receiptData.discount_amount > 0 ? `
        <div class="line-item">
            <span>${t('receipt.discount')}</span>
            <span>-${receiptData.discount_amount.toFixed(3)} ${t('common.currency')}</span>
        </div>
        ` : ''}
        ${receiptData.loyalty_discount > 0 ? `
        <div class="line-item">
            <span>${t('receipt.loyaltyDiscount')}</span>
            <span>-${receiptData.loyalty_discount.toFixed(3)} ${t('common.currency')}</span>
        </div>
        ` : ''}
        ${receiptData.tax_amount > 0 ? `
        <div class="line-item">
            <span>${t('receipt.tax')}</span>
            <span>${receiptData.tax_amount.toFixed(3)} ${t('common.currency')}</span>
        </div>
        ` : ''}
        <div class="line-item total-line">
            <span class="bold">${t('receipt.total')}</span>
            <span class="bold">${receiptData.total_amount.toFixed(3)} ${t('common.currency')}</span>
        </div>
    </div>

    <div class="divider"></div>

    <div class="payment">
        <div class="line-item">
            <span>${t('receipt.paymentMethod')}</span>
            <span>${t(`payment.${receiptData.payment_method}`)}</span>
        </div>
        <div class="line-item">
            <span>${t('receipt.paid')}</span>
            <span>${receiptData.paid_amount.toFixed(3)} ${t('common.currency')}</span>
        </div>
        ${receiptData.change_amount > 0 ? `
        <div class="line-item">
            <span>${t('receipt.change')}</span>
            <span>${receiptData.change_amount.toFixed(3)} ${t('common.currency')}</span>
        </div>
        ` : ''}
    </div>

    ${receiptData.customer && (receiptData.loyalty_points_used > 0 || receiptData.loyalty_points_earned > 0) ? `
    <div class="divider"></div>
    <div class="loyalty">
        ${receiptData.loyalty_points_used > 0 ? `
        <div class="line-item">
            <span>${t('receipt.pointsUsed')}</span>
            <span>${receiptData.loyalty_points_used}</span>
        </div>
        ` : ''}
        ${receiptData.loyalty_points_earned > 0 ? `
        <div class="line-item">
            <span>${t('receipt.pointsEarned')}</span>
            <span>${receiptData.loyalty_points_earned}</span>
        </div>
        ` : ''}
    </div>
    ` : ''}

    <div class="footer center">
        <div>${t('receipt.thankYou')}</div>
        <div>${t('receipt.visitAgain')}</div>
    </div>
</body>
</html>
    `;
  };

  const generateReceiptText = (): string => {
    let text = `
${receiptData.boutique_name}
${t('receipt.invoice')} #${receiptData.invoice_number}
${new Date(receiptData.sale_date).toLocaleString()}
${t('receipt.cashier')}: ${receiptData.cashier_name}

`;

    if (receiptData.customer) {
      text += `${t('receipt.customer')}: ${receiptData.customer.name}
${t('receipt.membership')}: ${receiptData.customer.membership_number}
${t('receipt.tier')}: ${receiptData.customer.tier}

`;
    }

    text += `${t('receipt.items')}:
`;

    receiptData.items.forEach(item => {
      text += `${item.product.name}
${item.quantity} x ${item.unit_price.toFixed(3)} = ${item.line_total.toFixed(3)}

`;
    });

    text += `
${t('receipt.subtotal')}: ${receiptData.subtotal.toFixed(3)} ${t('common.currency')}`;

    if (receiptData.discount_amount > 0) {
      text += `
${t('receipt.discount')}: -${receiptData.discount_amount.toFixed(3)} ${t('common.currency')}`;
    }

    if (receiptData.loyalty_discount > 0) {
      text += `
${t('receipt.loyaltyDiscount')}: -${receiptData.loyalty_discount.toFixed(3)} ${t('common.currency')}`;
    }

    if (receiptData.tax_amount > 0) {
      text += `
${t('receipt.tax')}: ${receiptData.tax_amount.toFixed(3)} ${t('common.currency')}`;
    }

    text += `
${t('receipt.total')}: ${receiptData.total_amount.toFixed(3)} ${t('common.currency')}

${t('receipt.paymentMethod')}: ${t(`payment.${receiptData.payment_method}`)}
${t('receipt.paid')}: ${receiptData.paid_amount.toFixed(3)} ${t('common.currency')}`;

    if (receiptData.change_amount > 0) {
      text += `
${t('receipt.change')}: ${receiptData.change_amount.toFixed(3)} ${t('common.currency')}`;
    }

    if (receiptData.customer && (receiptData.loyalty_points_used > 0 || receiptData.loyalty_points_earned > 0)) {
      text += `

`;
      if (receiptData.loyalty_points_used > 0) {
        text += `${t('receipt.pointsUsed')}: ${receiptData.loyalty_points_used}
`;
      }
      if (receiptData.loyalty_points_earned > 0) {
        text += `${t('receipt.pointsEarned')}: ${receiptData.loyalty_points_earned}
`;
      }
    }

    text += `

${t('receipt.thankYou')}
${t('receipt.visitAgain')}`;

    return text;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('receipt.actions')}
        </h3>
        <div className="text-sm text-gray-600">
          {receiptData.invoice_number}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={printReceipt}
          className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Printer className="w-6 h-6 text-blue-600 mb-2" />
          <span className="text-sm font-medium text-gray-900">
            {t('receipt.print')}
          </span>
        </button>

        <button
          onClick={downloadReceipt}
          className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download className="w-6 h-6 text-green-600 mb-2" />
          <span className="text-sm font-medium text-gray-900">
            {t('receipt.download')}
          </span>
        </button>

        <button
          onClick={shareReceipt}
          className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Share2 className="w-6 h-6 text-purple-600 mb-2" />
          <span className="text-sm font-medium text-gray-900">
            {t('receipt.share')}
          </span>
        </button>
      </div>

      {/* معاينة الإيصال */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          {t('receipt.preview')}
        </h4>
        <div 
          className="bg-gray-50 p-4 rounded border text-xs font-mono overflow-auto max-h-64"
          style={{ fontFamily: 'monospace' }}
          dangerouslySetInnerHTML={{
            __html: generateReceiptHTML().replace(/<!DOCTYPE[\s\S]*?<body[^>]*>/, '').replace(/<\/body>[\s\S]*$/, '')
          }}
        />
      </div>
    </div>
  );
};

export default ReceiptPrinter;