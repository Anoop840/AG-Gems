const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendOrderConfirmation = async (email, order) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Order Confirmation - ${order.orderNumber}`,
    html: `
      <h1>Order Confirmed!</h1>
      <p>Thank you for your order. Your order number is: <strong>${order.orderNumber}</strong></p>
      <h2>Order Details:</h2>
      <ul>
        ${order.items.map(item => `
          <li>${item.name} x ${item.quantity} - ₹${item.price}</li>
        `).join('')}
      </ul>
      <p><strong>Total: ₹${order.total}</strong></p>
      <p>We will notify you when your order is shipped.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

exports.sendPasswordReset = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};
