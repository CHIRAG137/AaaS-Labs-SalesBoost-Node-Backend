const nodemailer = require('nodemailer');

exports.sendCustomEmail = async (to, pdfBuffer, config) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.emailSender,
      pass: config.emailPass
    }
  });

  await transporter.sendMail({
    from: config.emailSender,
    to,
    subject: 'Your Invoice',
    text: 'Attached is your invoice.',
    attachments: [
      { filename: 'invoice.pdf', content: pdfBuffer }
    ]
  });
};
