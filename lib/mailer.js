const nodemailer = require('nodemailer');

let cachedTransporter = null;

function createTransporter() {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const {
    MAILER_HOST,
    MAILER_PORT,
    MAILER_SECURE,
    MAILER_USER,
    MAILER_PASS
  } = process.env;

  if (!MAILER_HOST || !MAILER_USER || !MAILER_PASS) {
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    host: MAILER_HOST,
    port: Number(MAILER_PORT) || 587,
    secure: MAILER_SECURE === 'true',
    auth: {
      user: MAILER_USER,
      pass: MAILER_PASS
    }
  });

  return cachedTransporter;
}

async function sendContactMessage({ name, email, phone, message, to }) {
  const transporter = createTransporter();
  const recipient = to || process.env.MAILER_TO || process.env.MAILER_USER || process.env.CONTACT_EMAIL;
  const subject = `Message du site Les Charmettes - ${name || 'Contact'}`;
  const plainBody = [
    `Nom : ${name || 'Non renseigné'}`,
    `Email : ${email || 'Non renseigné'}`,
    `Téléphone : ${phone || 'Non renseigné'}`,
    '',
    'Message :',
    message || ''
  ].join('\n');
  const htmlBody = [
    `<p><strong>Nom :</strong> ${name || 'Non renseigné'}</p>`,
    `<p><strong>Email :</strong> ${email || 'Non renseigné'}</p>`,
    `<p><strong>Téléphone :</strong> ${phone || 'Non renseigné'}</p>`,
    '<p><strong>Message :</strong></p>',
    `<p>${(message || '').replace(/\n/g, '<br>')}</p>`
  ].join('\n');

  if (!transporter || !recipient) {
    console.warn('[mailer] Aucune configuration SMTP détectée. Message enregistré en console.');
    console.info(plainBody);
    return;
  }

  await transporter.sendMail({
    from: `Les Charmettes <${process.env.MAILER_USER}>`,
    to: recipient,
    replyTo: email,
    subject,
    text: plainBody,
    html: htmlBody
  });
}

module.exports = {
  sendContactMessage
};
