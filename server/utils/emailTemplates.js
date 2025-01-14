const getTopUpEmailTemplate = (transaction) => {
    const date = new Date(transaction.createdAt).toLocaleString();
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Top-up Confirmation</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                .header {
                    background: linear-gradient(135deg, #4f46e5, #3b82f6);
                    color: white;
                    padding: 20px;
                    text-align: center;
                }
                .content {
                    padding: 20px;
                }
                .transaction-details {
                    background: #f8fafc;
                    border-radius: 8px;
                    padding: 15px;
                    margin: 20px 0;
                }
                .amount {
                    font-size: 24px;
                    color: #16a34a;
                    font-weight: bold;
                    text-align: center;
                    margin: 10px 0;
                }
                .footer {
                    text-align: center;
                    padding: 20px;
                    color: #6b7280;
                    font-size: 14px;
                }
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #4f46e5;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin-top: 15px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Top-up Successful!</h1>
                </div>
                <div class="content">
                    <p>Dear ${transaction.customerName},</p>
                    <p>Your card has been successfully topped up. Here are the details of your transaction:</p>
                    
                    <div class="amount">
                        ${transaction.currency} ${transaction.amount}
                    </div>
                    
                    <div class="transaction-details">
                        <p><strong>Transaction Date:</strong> ${date}</p>
                        <p><strong>Card Number:</strong> ${transaction.cardNumber}</p>
                        <p><strong>Payment Method:</strong> ${transaction.paymentMethod}</p>
                        <p><strong>Transaction ID:</strong> ${transaction._id}</p>
                    </div>
                    
                    <p>Your new card balance has been updated and is ready for use.</p>
                    
                    <center>
                        <a href="${process.env.FRONTEND_URL}/dashboard" class="button">
                            View Dashboard
                        </a>
                    </center>
                </div>
                <div class="footer">
                    <p>Thank you for using our service!</p>
                    <p>If you didn't make this transaction, please contact our support immediately.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

module.exports = {
    getTopUpEmailTemplate
}; 