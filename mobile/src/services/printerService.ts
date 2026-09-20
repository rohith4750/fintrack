import { Collection, Loan, Customer } from '../types';

export const PrinterService = {
  // Format ESC/POS 58mm / 80mm Thermal Receipt Plain Text
  generateReceiptText: (collection: Collection, loan?: Loan, customer?: Customer): string => {
    const divider = '--------------------------------\n';
    const doubleDivider = '================================\n';

    let out = '';
    out += '       FINTRACK FINANCE PVT LTD\n';
    out += '   Microfinance & Micro-Lending Hub\n';
    out += '      Ph: 0883-2478901 / 9848034567\n';
    out += doubleDivider;
    out += '      OFFICIAL PAYMENT RECEIPT\n';
    out += doubleDivider;
    out += `Receipt No   : ${collection.receiptNumber}\n`;
    out += `Date & Time  : ${collection.collectionDate}${collection.time ? ` ${collection.time}` : ''}\n`;
    out += `Agent ID/Name: ${collection.agentId} / ${collection.agentName}\n`;
    out += `Route / Beat : ${collection.routeName}\n`;
    out += divider;
    out += `Customer Code: ${collection.customerCode}\n`;
    out += `Customer Name: ${collection.customerName}\n`;
    out += `Loan Number  : ${collection.loanNumber}\n`;
    out += divider;
    out += `AMOUNT PAID  : INR ${collection.amount.toLocaleString('en-IN')}.00\n`;
    out += `Payment Mode : ${collection.paymentMethod}${collection.upiTransactionId ? ` (${collection.upiTransactionId})` : ''}\n`;

    if (collection.weeksCleared && collection.weeksCleared > 1) {
      out += `Advance Paid : ${collection.weeksCleared} WEEKS ADVANCE CLEARED\n`;
    }

    if (loan) {
      const paidWeeks = Math.min(loan.durationUnits, Math.round((loan.totalPaidAmount + collection.amount) / (loan.installmentAmount || 1)));
      out += `Tenure Status: ${paidWeeks} / ${loan.durationUnits} Weeks Cleared\n`;
      out += `Remaining Bal: INR ${Math.max(0, loan.outstandingBalance - collection.amount).toLocaleString('en-IN')}.00\n`;
    } else {
      out += `Remaining Bal: INR ${collection.balanceAfterPayment.toLocaleString('en-IN')}.00\n`;
    }

    out += divider;
    out += '     THANK YOU FOR TIMELY PAYMENT!\n';
    out += '  Customer Helpline: 1800-425-9988\n';
    out += '  Keep this slip as proof of payment\n';
    out += doubleDivider;
    out += '\n\n\n'; // Feed paper
    return out;
  },

  // Mock Bluetooth Print Trigger (Connects to ESC/POS Bluetooth Mini-Printers)
  printViaBluetooth: async (collection: Collection, loan?: Loan, customer?: Customer): Promise<{ success: boolean; message: string }> => {
    const receiptContent = PrinterService.generateReceiptText(collection, loan, customer);
    console.log('--- THERMAL PRINTER ESC/POS BUFFER ---');
    console.log(receiptContent);

    // Simulate 400ms printer communication delay
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      success: true,
      message: `Thermal receipt printed on 58mm Bluetooth Printer (Voucher #${collection.receiptNumber})`,
    };
  },

  // WhatsApp receipt share message generator
  generateWhatsAppMessage: (collection: Collection): string => {
    return encodeURIComponent(
      `*FINTRACK PAYMENT RECEIPT*\n` +
      `Receipt No: *${collection.receiptNumber}*\n` +
      `Customer: *${collection.customerName}* (${collection.customerCode})\n` +
      `Loan No: *${collection.loanNumber}*\n` +
      `Amount Paid: *₹${collection.amount.toLocaleString('en-IN')}*\n` +
      `Date: ${collection.collectionDate}${collection.time ? ` ${collection.time}` : ''}\n` +
      `Collected By: ${collection.agentName}\n` +
      `Balance Remaining: *₹${collection.balanceAfterPayment.toLocaleString('en-IN')}*\n\n` +
      `Thank you for banking with FinTrack!`
    );
  },
};
