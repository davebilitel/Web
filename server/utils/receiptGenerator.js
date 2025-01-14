const jsPDF = require('jspdf');

function generateReceipt(orderData) {
    const doc = new jsPDF();
    
    // Add company logo/header
    doc.setFontSize(20);
    doc.setTextColor(0, 102, 204);
    doc.text('CardStore', 105, 20, { align: 'center' });
    
    // Add receipt title
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Payment Receipt', 105, 35, { align: 'center' });
    
    // Add horizontal line
    doc.setLineWidth(0.5);
    doc.line(20, 40, 190, 40);
    
    // Add order details
    doc.setFontSize(12);
    doc.text(`Order Date: ${new Date(orderData.createdAt).toLocaleString()}`, 20, 55);
    doc.text(`Transaction ID: ${orderData.transaction_id || orderData.reference}`, 20, 65);
    doc.text(`Payment Method: ${orderData.paymentMethod}`, 20, 75);
    
    // Add customer details
    doc.text('Customer Details:', 20, 90);
    doc.text(`Name: ${orderData.user.name}`, 30, 100);
    doc.text(`Email: ${orderData.user.email}`, 30, 110);
    doc.text(`Phone: ${orderData.user.phone}`, 30, 120);
    
    // Add product details
    doc.text('Product Details:', 20, 140);
    doc.text(`Card Type: ${orderData.cardType} Virtual Card`, 30, 150);
    doc.text(`Card Balance: ${orderData.amount - 1} ${orderData.currency || 'XAF'}`, 30, 160);
    doc.text(`Service Fee: 1 ${orderData.currency || 'XAF'}`, 30, 170);
    doc.text(`Payment Method: ${orderData.paymentMethod}`, 30, 180);

    if (orderData.payment_details) {
        doc.text(`Payment Reference: ${orderData.payment_details.flw_ref || orderData.reference}`, 30, 190);
    }
    
    // Add total amount
    doc.setLineWidth(0.5);
    doc.line(20, 180, 190, 180);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Amount: $${orderData.amount}`, 20, 190);
    
    // Add footer
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Thank you for your purchase!', 105, 270, { align: 'center' });
    doc.text('For support, contact support@cardstore.com', 105, 275, { align: 'center' });
    
    return doc.output('arraybuffer');
}

module.exports = generateReceipt; 