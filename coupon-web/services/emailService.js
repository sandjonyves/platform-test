require("dotenv").config();
const nodemailer = require("nodemailer");

/* =======================
   CONFIG SMTP (variables d'environnement, jamais en dur dans le code)
   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS,
   MAIL_FROM_EMAIL, MAIL_FROM_NAME
   SMTP_ALLOW_SELF_SIGNED=true si le serveur mail a un certificat auto-signé
======================= */
const {
  SMTP_HOST,
  SMTP_PORT = "465",
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  SMTP_ALLOW_SELF_SIGNED,
} = process.env;

const MAIL_FROM = {
  name: process.env.MAIL_FROM_NAME || "Platform Web Test",
  address: process.env.MAIL_FROM_EMAIL || "noreply@plateform-test.cm",
};

const port = Number(SMTP_PORT) || 465;
const isConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

const transporter = isConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      // 465 = SSL direct ; 587 = STARTTLS
      secure: SMTP_SECURE ? SMTP_SECURE === "true" : port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      tls: { rejectUnauthorized: SMTP_ALLOW_SELF_SIGNED !== "true" },
    })
  : null;

/* =======================
   TEST SMTP AU DÉMARRAGE
======================= */
if (!transporter) {
  console.warn(" Email désactivé : définir SMTP_HOST, SMTP_USER et SMTP_PASS.");
} else if (process.env.NODE_ENV !== "test") {
  transporter.verify((error) => {
    if (error) {
      console.error(" Erreur SMTP :", error.message);
    } else {
      console.log(" Serveur SMTP prêt à envoyer des emails");
    }
  });
}

/* =======================
   GENERATION DES CODES
======================= */
const generateCodesSection = (couponData) => {
  const codes = [];
  const codeInfos = ["code1", "code2", "code3", "code4"];

  codeInfos.forEach((key, i) => {
    const value = couponData[key];
    if (!value) return;

    const valid = couponData[`${key}Valid`];
    const status = valid ? "Valide" : "Invalide";
    const color = valid ? "#28a745" : "#dc3545";

    codes.push(`
      <div style="display:flex;justify-content:space-between;align-items:center;
           padding:10px;border:1px solid #dee2e6;border-radius:5px;
           margin-bottom:8px;background:#f8f9fa;">
        <strong style="color:#555;">Code ${i + 1} :</strong>
        <span style="color:${color};font-weight:bold;">${status}</span>
      </div>
    `);
  });

  return codes.join("");
};

/* =======================
   ENVOI EMAIL COUPON
======================= */
const sendCouponReceivedEmail = async (couponId, couponData) => {
  if (!transporter) {
    return { success: false, message: "Envoi d'email non configuré (variables SMTP_* manquantes)" };
  }

  try {
    if (!couponData.email) {
      return { success: false, message: "Aucune adresse email fournie" };
    }

    const htmlContent = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;">
        
        <div style="background:linear-gradient(135deg,#667eea,#764ba2);
          color:white;padding:30px;border-radius:15px;text-align:center;">
          <h1 style="margin:0;font-size:24px;">Platform Web Test</h1>
        </div>

        <div style="background:white;padding:30px;border-radius:15px;
          margin-top:20px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
          
          <p style="color:#666;line-height:1.6;">
            Type de coupon : <strong>${couponData.type}</strong><br>
            Montant : <strong>${couponData.montant} ${couponData.devise}</strong>
          </p>

          ${generateCodesSection(couponData)}
        </div>

        <p style="margin-top:30px;text-align:center;color:#333;">
          🙏 Merci pour votre confiance.
        </p>

        <div style="text-align:center;margin-top:20px;color:#999;font-size:12px;">
          © ${new Date().getFullYear()} Platform Web Test
        </div>

      </div>
    `;

    await transporter.sendMail({
      from: MAIL_FROM,
      to: couponData.email,
      subject: "Confirmation de vérification de coupon",
      text: `Type: ${couponData.type} - Montant: ${couponData.montant} ${couponData.devise}`,
      html: htmlContent,
    });

    console.log("✅ Email envoyé avec succès");
    return { success: true, message: "Email envoyé avec succès" };

  } catch (error) {
    console.error(" Erreur lors de l'envoi :", error);
    return { success: false, message: "Erreur lors de l'envoi de l'email" };
  }
};

module.exports = { sendCouponReceivedEmail };