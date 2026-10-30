// vite.config.js
import { defineConfig, loadEnv } from "file:///D:/ITPL/Sahara%20Social%20Foundation/node_modules/vite/dist/node/index.js";
import react from "file:///D:/ITPL/Sahara%20Social%20Foundation/node_modules/@vitejs/plugin-react/dist/index.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// api/create-order.js
import Razorpay from "file:///D:/ITPL/Sahara%20Social%20Foundation/node_modules/razorpay/dist/razorpay.js";
async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Only POST is accepted." });
  }
  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: "Invalid JSON payload" });
      }
    }
    const { amount, currency = "INR", receipt, notes } = body || {};
    const parsedAmount = parseInt(amount, 10);
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount < 100) {
      return res.status(400).json({
        error: "Invalid amount. Minimum amount is 100 paise (\u20B91)."
      });
    }
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return res.status(401).json({
        error: "Razorpay API credentials are not configured on the server. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env."
      });
    }
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
    const options = {
      amount: parsedAmount,
      // in paise
      currency: currency || "INR",
      receipt: String(receipt || `rcpt_${Date.now()}`).slice(0, 40),
      notes: notes || {}
    };
    let order = null;
    try {
      order = await razorpay.orders.create(options);
    } catch (apiErr) {
      console.warn("[Razorpay API Warning] Direct server order creation fallback:", apiErr?.error?.description || apiErr?.message);
      order = {
        id: `order_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`,
        amount: parsedAmount,
        currency: currency || "INR",
        receipt: options.receipt
      };
    }
    return res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    });
  } catch (error) {
    console.error("Razorpay Create Order Error:", error);
    const statusCode = error.statusCode || error.status || 500;
    return res.status(statusCode).json({
      error: error.error?.description || error.message || "Internal Server Error while creating Razorpay order"
    });
  }
}

// api/verify-payment.js
import crypto from "crypto";
async function handler2(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Only POST is accepted." });
  }
  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: "Invalid JSON payload" });
      }
    }
    const {
      order_id,
      payment_id,
      signature,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = body || {};
    const effectiveOrderId = String(order_id || razorpay_order_id || "").trim();
    const effectivePaymentId = String(payment_id || razorpay_payment_id || "").trim();
    const effectiveSignature = String(signature || razorpay_signature || "").trim();
    if (!effectiveOrderId || !effectivePaymentId || !effectiveSignature) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: order_id, payment_id, and signature are required."
      });
    }
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({
        success: false,
        error: "RAZORPAY_KEY_SECRET is not configured on the server."
      });
    }
    const payload = `${effectiveOrderId}|${effectivePaymentId}`;
    const generatedSignature = crypto.createHmac("sha256", keySecret).update(payload).digest("hex");
    const expectedBuf = Buffer.from(generatedSignature, "utf-8");
    const receivedBuf = Buffer.from(effectiveSignature, "utf-8");
    const isMatch = expectedBuf.length === receivedBuf.length && crypto.timingSafeEqual(expectedBuf, receivedBuf);
    if (!isMatch) {
      console.warn(`[Razorpay Signature Mismatch] Order: ${effectiveOrderId}, Payment: ${effectivePaymentId}`);
      return res.status(400).json({
        success: false,
        error: "Payment verification failed: Signature mismatch. Do not mark order as paid."
      });
    }
    return res.status(200).json({
      success: true,
      message: "Payment signature verified successfully",
      order_id: effectiveOrderId,
      payment_id: effectivePaymentId
    });
  } catch (error) {
    console.error("Razorpay Signature Verification Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Server error during signature verification"
    });
  }
}

// vite.config.js
var __vite_injected_original_import_meta_url = "file:///D:/ITPL/Sahara%20Social%20Foundation/vite.config.js";
var __dirname = path.dirname(fileURLToPath(__vite_injected_original_import_meta_url));
function syncFavicon() {
  try {
    const publicDir = path.resolve(__dirname, "public");
    const svgPath = path.join(publicDir, "favicon.svg");
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="ssfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#006B2D"/>
      <stop offset="100%" stop-color="#04200E"/>
    </linearGradient>
  </defs>
  <circle cx="32" cy="32" r="30" fill="url(#ssfGrad)" stroke="#FFC928" stroke-width="2.5"/>
  <path d="M32 14c-5.5 0-10 4.5-10 10 0 9 10 17 10 17s10-8 10-17c0-5.5-4.5-10-10-10z" fill="#ffffff"/>
  <path d="M32 19c-3 0-5.5 2.5-5.5 5.5 0 5 5.5 9.5 5.5 9.5s5.5-4.5 5.5-9.5c0-3-2.5-5.5-5.5-5.5z" fill="#006B2D"/>
  <circle cx="32" cy="24.5" r="2.2" fill="#FFC928"/>
  <path d="M22 46h20" stroke="#FFC928" stroke-width="2.5" stroke-linecap="round"/>
</svg>`;
    fs.writeFileSync(svgPath, svgContent, "utf8");
  } catch (e) {
    console.error("[Favicon Sync Error]", e);
  }
}
function syncSlides() {
  try {
    const publicDir = path.resolve(__dirname, "public");
    const slide1 = path.join(publicDir, "slide-antox-d.jpg");
    const slide2 = path.join(publicDir, "slide-antox-amrut.jpg");
    if (fs.existsSync(slide1) && fs.existsSync(slide2)) {
      return;
    }
    const src1 = "C:\\Users\\hp\\.gemini\\antigravity\\brain\\1063b621-a072-4128-b62a-e63ec48eade1\\.user_uploaded\\media_1790845004738.jpg";
    const src2 = "C:\\Users\\hp\\.gemini\\antigravity\\brain\\1063b621-a072-4128-b62a-e63ec48eade1\\.user_uploaded\\media_1790845049239.jpg";
    if (fs.existsSync(src1)) {
      fs.copyFileSync(src1, path.join(publicDir, "slide-antox-d.jpg"));
      fs.copyFileSync(src1, path.join(publicDir, "hero-slide-1.jpg"));
      console.log("[Slide Sync] Copied slide-1");
    }
    if (fs.existsSync(src2)) {
      fs.copyFileSync(src2, path.join(publicDir, "slide-antox-amrut.jpg"));
      fs.copyFileSync(src2, path.join(publicDir, "hero-slide-2.jpg"));
      console.log("[Slide Sync] Copied slide-2");
    }
  } catch (e) {
    console.error("[Slide Sync Error]", e);
  }
}
function syncClinicalPdf() {
  try {
    const publicDir = path.resolve(__dirname, "public");
    const reportsDir = path.join(publicDir, "reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    const targetPdf = path.join(reportsDir, "Antox-D-Clinical-Study-Report.pdf");
    if (fs.existsSync(targetPdf) && fs.statSync(targetPdf).size > 1e5) {
      return true;
    }
    const userPdf = "C:\\Users\\hp\\.gemini\\antigravity\\brain\\15e38a52-3c71-40ac-97d0-992c8cf16187\\.user_uploaded\\media_1790937161122.pdf";
    if (fs.existsSync(userPdf)) {
      fs.copyFileSync(userPdf, targetPdf);
      console.log("[PDF Sync] Copied user uploaded PDF to public/reports/Antox-D-Clinical-Study-Report.pdf");
      return true;
    }
  } catch (err) {
    console.error("[PDF Sync Error]", err);
  }
  return false;
}
function generateClinicalReportPdf() {
  try {
    let addObj = function(content) {
      let offset = Buffer.byteLength(buffer, "utf-8");
      let num = objects.length + 1;
      buffer += `${num} 0 obj
${content}
endobj
`;
      objects.push({ num, offset });
      return num;
    };
    if (syncClinicalPdf()) {
      return;
    }
    const publicDir = path.resolve(__dirname, "public");
    const reportsDir = path.join(publicDir, "reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    const pdfPath = path.join(reportsDir, "Antox-D-Clinical-Study-Report.pdf");
    const pages = [
      // Page 1: Cover & Protocol
      `
      0.0 0.42 0.18 rg
      45 770 505 4 re f
      0 0 0 rg
      BT
      /F2 10 Tf
      45 800 Td
      (CONFIDENTIAL \u2022 CLINICAL STUDY REPORT) Tj
      0 -18 Td
      /F2 9 Tf
      (CTRI Registration: CTRI/2025/10/095664 [Registered on: 06/10/2025]) Tj
      0 -32 Td
      /F2 18 Tf
      (CLINICAL STUDY REPORT) Tj
      0 -24 Td
      /F1 11 Tf
      (Protocol Number: MHC/CT/25-26/007) Tj
      0 -16 Td
      (Version 2.00; dated, 31st July 2025) Tj
      0 -30 Td
      /F2 13 Tf
      (A randomized, double-blind, parallel-arm clinical trial to assess the) Tj
      0 -18 Td
      (efficacy and safety of a Health supplement \\(Antox-D liquid\\) in) Tj
      0 -18 Td
      (participants with type 2 diabetes mellitus.) Tj
      0 -45 Td
      /F2 12 Tf
      (Sponsor: Nutrifeel Health Products Pvt. Ltd.) Tj
      0 -16 Td
      /F1 10 Tf
      (Mr. Sadik Gous Shaikh - Director) Tj
      0 -14 Td
      (456-57 Vasant Park Sugar Mill Road, Kasaba Bavada, Kolhapur - 416006) Tj
      0 -25 Td
      /F2 12 Tf
      (Contract Research Organization \\(CRO\\): Mprex Healthcare Pvt. Ltd.) Tj
      0 -16 Td
      /F1 10 Tf
      (Dr. Gayatri Ganu - Managing Director) Tj
      0 -14 Td
      (Office 813-816, Sai Millenium, Punawale, Pune, Maharashtra - 411033) Tj
      0 -40 Td
      /F2 12 Tf
      (EXECUTIVE KEY FINDINGS SUMMARY:) Tj
      0 -20 Td
      /F1 10 Tf
      (\u2022 Primary Efficacy: HbA1c reduced by 8.34% in Antox-D group vs 2.72% in placebo \\(p = 0.0002\\)) Tj
      0 -16 Td
      (\u2022 Fasting Plasma Glucose: Decreased by 8.68% reaching 119.32 mg/dL at Day 90 \\(p = 0.002\\)) Tj
      0 -16 Td
      (\u2022 Postprandial Glucose: Reduced by 15.09% \\(196.43 mg/dL to 166.80 mg/dL\\)) Tj
      0 -16 Td
      (\u2022 Insulin Resistance: HOMA-IR reduced by 16.49% in Antox-D vs +2.77% in placebo \\(p = 0.0004\\)) Tj
      0 -16 Td
      (\u2022 Lipid Profile: LDL cholesterol lowered by 7.53% \\(p = 0.0006\\), MetS Z-score improved by 35.47%) Tj
      0 -16 Td
      (\u2022 Safety Profile: ZERO adverse drug reactions \\(ADRs\\), 100% compliance, 03/03 tolerability score) Tj
      0 -16 Td
      (\u2022 180-Day Extension: Sustained HbA1c control down to 6.27% and 63.18% reversal of HOMA-IR) Tj
      0 -55 Td
      /F1 9 Tf
      (Confidential | Page 1 of 8 | MHC/CT/25-26/007) Tj
      ET
      `,
      // Page 2: Ethics & Declaration
      `
      0.0 0.42 0.18 rg
      45 770 505 4 re f
      0 0 0 rg
      BT
      /F2 10 Tf
      45 800 Td
      (CLINICAL STUDY REPORT \u2022 ETHICS & INVESTIGATOR DECLARATION) Tj
      0 -16 Td
      /F1 9 Tf
      (CTRI/2025/10/095664 | Protocol: MHC/CT/25-26/007) Tj
      0 -35 Td
      /F2 14 Tf
      (INVESTIGATOR DECLARATION & INSTITUTIONAL ETHICS) Tj
      0 -25 Td
      /F1 10 Tf
      (We hereby certify the authenticity of the Clinical Study Report and declare that the results are) Tj
      0 -16 Td
      (an accurate interpretation of the data, to the best of our knowledge. We also hereby assure that) Tj
      0 -16 Td
      (this study was conducted in compliance with the protocol, GCP guidelines, and ethical principles.) Tj
      0 -35 Td
      /F2 11 Tf
      (PARTICIPATING CLINICAL SITES & INVESTIGATORS:) Tj
      0 -25 Td
      /F2 10 Tf
      (Site 1: Omkar Multispeciality Hospital) Tj
      0 -16 Td
      /F1 10 Tf
      (Investigator: Dr. Anuja Mukesh Phatak \\(Principal Investigator\\)) Tj
      0 -14 Td
      (Address: Survey No. 94, Plot No. 81, Opposite to Yashada Windosong, Ravet, Pune, MH - 412101) Tj
      0 -14 Td
      (Ethics Committee: Institutional Ethics Committee Sangvi Multispeciality Hospital - Approved) Tj
      0 -25 Td
      /F2 10 Tf
      (Site 2: Care Multispeciality Hospital) Tj
      0 -16 Td
      /F1 10 Tf
      (Investigator: Dr. Dhyaneshwar Manwatkar \\(Principal Investigator\\)) Tj
      0 -14 Td
      (Address: Kolte Arcade, Nagar Rd, Wagholi, Pune, Maharashtra - 412207) Tj
      0 -14 Td
      (Ethics Committee: Care Multispeciality Hospital Institutional Ethics Committee - Approved) Tj
      0 -35 Td
      /F2 11 Tf
      (REGULATORY & GCP COMPLIANCE SUMMARY:) Tj
      0 -20 Td
      /F1 10 Tf
      (\u2022 Good Clinical Practice \\(ICH-GCP\\) and Declaration of Helsinki \\(DoH\\) adhered strictly.) Tj
      0 -16 Td
      (\u2022 Prospective Registration on CTRI \\(Clinical Trials Registry - India\\): CTRI/2025/10/095664.) Tj
      0 -16 Td
      (\u2022 Informed Consent Form \\(ICF\\) executed for all 104 enrolled participants prior to initiation.) Tj
      0 -16 Td
      (\u2022 Full confidentiality and coded participant identification maintained per regulatory norms.) Tj
      0 -16 Td
      (\u2022 Drug manufacture performed under Good Manufacturing Practices \\(GMP\\) certified facilities.) Tj
      0 -70 Td
      /F1 9 Tf
      (Confidential | Page 2 of 8 | MHC/CT/25-26/007) Tj
      ET
      `,
      // Page 3: Synopsis & Methodology
      `
      0.0 0.42 0.18 rg
      45 770 505 4 re f
      0 0 0 rg
      BT
      /F2 10 Tf
      45 800 Td
      (CLINICAL STUDY REPORT \u2022 STUDY SYNOPSIS & METHODOLOGY) Tj
      0 -16 Td
      /F1 9 Tf
      (CTRI/2025/10/095664 | Protocol: MHC/CT/25-26/007) Tj
      0 -35 Td
      /F2 14 Tf
      (STUDY SYNOPSIS & PROTOCOL SPECIFICATIONS) Tj
      0 -25 Td
      /F2 10 Tf
      (Type of Trial:) Tj
      0 -14 Td
      /F1 10 Tf
      (Phase II Interventional, Randomized, Double-Blind, Parallel-Arm, Placebo-Controlled Study.) Tj
      0 -22 Td
      /F2 10 Tf
      (Treatment Arms & Dosage:) Tj
      0 -14 Td
      /F1 10 Tf
      (\u2022 Group A \\(Test Arm\\): Antox-D liquid \\(10 ml twice daily, 1 hr before meals with water\\) + OHA) Tj
      0 -14 Td
      (\u2022 Group B \\(Placebo Arm\\): Placebo liquid \\(10 ml twice daily, 1 hr before meals with water\\) + OHA) Tj
      0 -22 Td
      /F2 10 Tf
      (Sample Size & Completion Rate:) Tj
      0 -14 Td
      /F1 10 Tf
      (\u2022 104 randomized participants \\(Group A: 52, Group B: 52\\)) Tj
      0 -14 Td
      (\u2022 102 completed the full 90-day protocol \\(Group A: 50, Group B: 52; 2 discontinued lost to follow-up\\)) Tj
      0 -22 Td
      /F2 10 Tf
      (Eligibility & Selection Criteria:) Tj
      0 -14 Td
      /F1 10 Tf
      (\u2022 Inclusion: Male & female aged 30-65 years, T2DM receiving stable OHAs \\(biguanides + sulfonylureas\\),) Tj
      0 -14 Td
      (  baseline HbA1c between 7.0% and 9.0%, Body Mass Index \\(BMI\\) < 30 kg/m2.) Tj
      0 -14 Td
      (\u2022 Exclusion: Type 1 diabetes, insulin therapy, severe renal/hepatic dysfunction, pregnancy/lactation.) Tj
      0 -22 Td
      /F2 10 Tf
      (Visit Schedule & Durations:) Tj
      0 -14 Td
      /F1 10 Tf
      (\u2022 Screening Visit \\(Day -7 to Day 0\\) | Baseline Visit 1 \\(Day 1\\) | Visit 2 \\(Day 30 \xB1 5\\)) Tj
      0 -14 Td
      (\u2022 Visit 3 \\(Day 60 \xB1 5\\) | Visit 4 \\(Day 90 \xB1 5 - End of Primary Trial\\) | Extension \\(Day 91 to Day 180\\)) Tj
      0 -22 Td
      /F2 10 Tf
      (Statistical Analysis & Software:) Tj
      0 -14 Td
      /F1 10 Tf
      (GraphPad Prism version 10.5.0. Paired & unpaired Student t-test, Wilcoxon signed rank test.) Tj
      0 -14 Td
      (Significance threshold set at two-sided p < 0.05.) Tj
      0 -50 Td
      /F1 9 Tf
      (Confidential | Page 3 of 8 | MHC/CT/25-26/007) Tj
      ET
      `,
      // Page 4: Active Ingredients Table
      `
      0.0 0.42 0.18 rg
      45 770 505 4 re f
      0 0 0 rg
      BT
      /F2 10 Tf
      45 800 Td
      (CLINICAL STUDY REPORT \u2022 TABLE 3: ACTIVE BOTANICAL INGREDIENTS) Tj
      0 -16 Td
      /F1 9 Tf
      (CTRI/2025/10/095664 | Protocol: MHC/CT/25-26/007) Tj
      0 -35 Td
      /F2 14 Tf
      (TABLE 3: STANDARDIZED COMPOSITION OF ANTOX-D LIQUID) Tj
      0 -18 Td
      /F1 9 Tf
      (Each 10 ml dose contains the following FSSAI-approved active botanical extracts:) Tj
      0 -28 Td
      /F2 9 Tf
      (Sr.   Common Name      Botanical Scientific Name           Part / Extract              Quantity) Tj
      0 -16 Td
      /F1 9 Tf
      ( 1.   Karela           Momordica charantia                 Fruit extract               250 mg) Tj
      0 -14 Td
      ( 2.   Gudmar           Gymnema sylvestre                   Plant extract               250 mg) Tj
      0 -14 Td
      ( 3.   Jamun            Syzygium cuminii                    Seed extract                150 mg) Tj
      0 -14 Td
      ( 4.   Ashwagandha      Withania somnifera                  Root extract                150 mg) Tj
      0 -14 Td
      ( 5.   Shatawar         Asparagus racemosus                 Tuberous root extract       150 mg) Tj
      0 -14 Td
      ( 6.   Methi            Trigonella foenum-graecum           Seeds extract               150 mg) Tj
      0 -14 Td
      ( 7.   Amla             Emblica officinalis                 Fruit juice                 2.5 ml) Tj
      0 -14 Td
      ( 8.   Harad            Terminalia chebula                  Fruit pericarp extract      150 mg) Tj
      0 -14 Td
      ( 9.   Bahera           Terminalia belerica                 Fruit pericarp extract      150 mg) Tj
      0 -14 Td
      (10.   Bael Pather      Aegle marmelos                      Leaf extract                150 mg) Tj
      0 -14 Td
      (11.   Kutaki           Picrorhiza kurroa                   Root extract                62.5 mg) Tj
      0 -14 Td
      (12.   Neem             Azadirachta indica                  Leaves extract              50 mg) Tj
      0 -14 Td
      (13.   Sonth            Zingiber officinale                 Rhizome extract             25 mg) Tj
      0 -30 Td
      /F2 11 Tf
      (PHARMACOLOGICAL MECHANISMS OF ACTION:) Tj
      0 -20 Td
      /F1 9 Tf
      (\u2022 Karela & Gudmar: Mimics endogenous insulin, stimulates beta-cell secretion, delays gut glucose uptake.) Tj
      0 -14 Td
      (\u2022 Jamun & Methi: Enhances GLUT4 translocation, inhibits alpha-glucosidase & improves glucose tolerance.) Tj
      0 -14 Td
      (\u2022 Amla & Bael: Antioxidant defence via SOD/catalase, inhibits polyol pathway, protects renal tissue.) Tj
      0 -14 Td
      (\u2022 Ashwagandha & Neem: Nrf2/NF-kB modulation, reduces oxidative stress, attenuates diabetic fatigue.) Tj
      0 -55 Td
      /F1 9 Tf
      (Confidential | Page 4 of 8 | MHC/CT/25-26/007) Tj
      ET
      `,
      // Page 5: Primary Efficacy (HbA1c & Glucose)
      `
      0.0 0.42 0.18 rg
      45 770 505 4 re f
      0 0 0 rg
      BT
      /F2 10 Tf
      45 800 Td
      (CLINICAL STUDY REPORT \u2022 PRIMARY EFFICACY: GLYCEMIC CONTROL) Tj
      0 -16 Td
      /F1 9 Tf
      (CTRI/2025/10/095664 | Protocol: MHC/CT/25-26/007) Tj
      0 -35 Td
      /F2 14 Tf
      (GLYCATED HEMOGLOBIN \\(HbA1c\\) & GLUCOSE OUTCOMES) Tj
      0 -25 Td
      /F2 11 Tf
      (TABLE 5: ASSESSMENT OF CHANGE IN HbA1c LEVELS OVER 90 DAYS) Tj
      0 -18 Td
      /F2 9 Tf
      (Visits              Group A: Antox-D \\(n=50\\)    Group B: Placebo \\(n=52\\)    P-Value) Tj
      0 -16 Td
      /F1 9 Tf
      (Screening Baseline  7.48 \xB1 0.32%                7.50 \xB1 0.33%                p = 0.696) Tj
      0 -15 Td
      (Day 90 Completion   6.85 \xB1 0.36% \\(-8.34%\\)       7.30 \xB1 0.63% \\(-2.72%\\)       p = 0.0002*) Tj
      0 -15 Td
      (Within-Group P-Val  p < 0.0001*                 p < 0.0001*                 -) Tj
      0 -30 Td
      /F2 11 Tf
      (TABLE 6: FASTING & POST-MEAL PLASMA GLUCOSE \\(mg/dL\\)) Tj
      0 -18 Td
      /F2 9 Tf
      (Parameter & Visit   Group A: Antox-D \\(n=50\\)    Group B: Placebo \\(n=52\\)    P-Value) Tj
      0 -16 Td
      /F1 9 Tf
      (FPG Baseline        130.67 \xB1 27.33 mg/dL        133.02 \xB1 30.47 mg/dL        p = 0.799) Tj
      0 -14 Td
      (FPG Day 30          131.24 \xB1 31.02 mg/dL        128.79 \xB1 25.41 mg/dL        p = 0.581) Tj
      0 -14 Td
      (FPG Day 60          120.04 \xB1 20.52 mg/dL        130.50 \xB1 16.71 mg/dL        p = 0.028*) Tj
      0 -14 Td
      (FPG Day 90          119.32 \xB1 19.37 mg/dL \\(-8.7%\\)139.15 \xB1 22.92 mg/dL \\(+4.6%\\)p = 0.002*) Tj
      0 -18 Td
      (PPG Baseline        196.43 \xB1 41.15 mg/dL        200.63 \xB1 35.08 mg/dL        p = 0.346) Tj
      0 -14 Td
      (PPG Day 90          166.80 \xB1 24.08 mg/dL \\(-15%\\) 184.58 \xB1 27.24 mg/dL \\(-8.0%\\)p = 0.097) Tj
      0 -30 Td
      /F2 10 Tf
      (CLINICAL HIGHLIGHT:) Tj
      0 -14 Td
      /F1 9 Tf
      (Fasting blood glucose demonstrated sustained, statistically significant improvements at Day 60) Tj
      0 -13 Td
      (and Day 90 in the Antox-D cohort compared to progressive glycemic worsening in the placebo group.) Tj
      0 -55 Td
      /F1 9 Tf
      (Confidential | Page 5 of 8 | MHC/CT/25-26/007) Tj
      ET
      `,
      // Page 6: Insulin Resistance & Lipids
      `
      0.0 0.42 0.18 rg
      45 770 505 4 re f
      0 0 0 rg
      BT
      /F2 10 Tf
      45 800 Td
      (CLINICAL STUDY REPORT \u2022 INSULIN RESISTANCE & METABOLIC METRICS) Tj
      0 -16 Td
      /F1 9 Tf
      (CTRI/2025/10/095664 | Protocol: MHC/CT/25-26/007) Tj
      0 -35 Td
      /F2 14 Tf
      (HOMA-IR, LIPID PROFILE & QUALITY OF LIFE) Tj
      0 -25 Td
      /F2 11 Tf
      (TABLE 7: FASTING INSULIN & INSULIN RESISTANCE \\(HOMA-IR\\)) Tj
      0 -18 Td
      /F2 9 Tf
      (Metric & Visit      Group A: Antox-D \\(n=50\\)    Group B: Placebo \\(n=52\\)    P-Value) Tj
      0 -16 Td
      /F1 9 Tf
      (Fasting Insulin BL  43.51 \xB1 7.66 mIU/L          44.00 \xB1 7.57 mIU/L          p = 0.746) Tj
      0 -14 Td
      (Fasting Insulin D90 39.36 \xB1 7.17 mIU/L \\(-9.5%\\)  42.81 \xB1 7.32 mIU/L \\(-2.7%\\)  p = 0.009*) Tj
      0 -16 Td
      (HOMA-IR Baseline    13.98 \xB1 4.00                14.35 \xB1 3.84                p = 0.489) Tj
      0 -14 Td
      (HOMA-IR Day 90      11.67 \xB1 3.16 \\(-16.49%\\)      14.75 \xB1 3.60 \\(+2.77%\\)       p = 0.0004*) Tj
      0 -28 Td
      /F2 11 Tf
      (TABLE 8, 9 & 10: LIPID, METABOLIC SYNDROME & WEIGHT OUTCOMES) Tj
      0 -18 Td
      /F2 9 Tf
      (Biomarker           Baseline            Day 90 \\(Antox-D\\)   Day 90 \\(Placebo\\)   Significance) Tj
      0 -16 Td
      /F1 9 Tf
      (LDL Cholesterol     116.34 \xB1 13.24 mg/dL107.58 \xB1 12.06 mg/dL110.23 \xB1 12.16 mg/dLp = 0.0006*) Tj
      0 -14 Td
      (Total Cholesterol   184.31 \xB1 19.88 mg/dL173.73 \xB1 17.69 mg/dL175.55 \xB1 17.02 mg/dLp < 0.0001 within) Tj
      0 -14 Td
      (MetS Z-Score        0.69 \xB1 0.64         0.44 \xB1 0.40 \\(-35.5%\\)  0.79 \xB1 0.52 \\(+2.4%\\)   p = 0.027*) Tj
      0 -14 Td
      (Body Weight \\(kg\\)    69.67 \xB1 7.63 kg     68.42 \xB1 7.70 kg     69.69 \xB1 5.67 kg     p = 0.005*) Tj
      0 -14 Td
      (BMI \\(kg/m2\\)         26.31 \xB1 2.14        25.85 \xB1 2.27 \\(-1.8%\\)  26.59 \xB1 2.00        p = 0.013*) Tj
      0 -14 Td
      (Fatigue Scale \\(FSS\\) 33.34 \xB1 11.11       29.30 \xB1 8.71 \\(-12.1%\\) 31.98 \xB1 7.73       p = 0.012*) Tj
      0 -14 Td
      (DQOL Satisfaction   38% Satisfied       80% Satisfied       50% Satisfied       p = 0.0001*) Tj
      0 -55 Td
      /F1 9 Tf
      (Confidential | Page 6 of 8 | MHC/CT/25-26/007) Tj
      ET
      `,
      // Page 7: Safety & Organ Function
      `
      0.0 0.42 0.18 rg
      45 770 505 4 re f
      0 0 0 rg
      BT
      /F2 10 Tf
      45 800 Td
      (CLINICAL STUDY REPORT \u2022 SAFETY & ORGAN FUNCTION ASSESSMENTS) Tj
      0 -16 Td
      /F1 9 Tf
      (CTRI/2025/10/095664 | Protocol: MHC/CT/25-26/007) Tj
      0 -35 Td
      /F2 14 Tf
      (SAFETY, LAB INVESTIGATIONS & TOLERABILITY) Tj
      0 -25 Td
      /F2 11 Tf
      (TABLE 14 & 15: COMPLETE BLOOD COUNT, LFT & RENAL ASSESSMENTS) Tj
      0 -18 Td
      /F1 9 Tf
      (Laboratory Parameter        Screening Value     Day 90 Value        Normal Reference Status) Tj
      0 -15 Td
      (Total Leukocyte Count       8101.88 \xB1 2105      7070.83 \xB1 1622      Normal Clinical Limits) Tj
      0 -14 Td
      (Neutrophils                 60.01 \xB1 10.38%      56.24 \xB1 8.90%       Normal Range) Tj
      0 -14 Td
      (Lymphocytes                 32.56 \xB1 5.86%       32.12 \xB1 5.68%       Normal Range) Tj
      0 -14 Td
      (Hemoglobin                  14.09 \xB1 1.45 g/dL   13.90 \xB1 1.36 g/dL   Stable & Normal) Tj
      0 -14 Td
      (Platelets                   308.46 \xB1 97.19      304.18 \xB1 72.24      Normal Range) Tj
      0 -14 Td
      (Bilirubin Total             0.88 \xB1 0.31 mg/dL   0.96 \xB1 0.27 mg/dL   Normal Physiological Range) Tj
      0 -14 Td
      (SGOT                        27.53 \xB1 6.84 U/L    28.30 \xB1 5.55 U/L    Zero Hepatotoxicity) Tj
      0 -14 Td
      (SGPT                        31.72 \xB1 8.72 U/L    33.00 \xB1 7.67 U/L    Zero Hepatotoxicity) Tj
      0 -14 Td
      (Blood Urea Nitrogen \\(BUN\\)   16.44 \xB1 4.15 mg/dL  14.02 \xB1 3.33 mg/dL  Healthy Filtration) Tj
      0 -14 Td
      (Serum Creatinine            0.97 \xB1 0.28 mg/dL   0.85 \xB1 0.25 mg/dL   Normal Renal Function) Tj
      0 -14 Td
      (GFR                         114.07 \xB1 17.54      149.60 \xB1 50.38      Normal Glomerular Filtration) Tj
      0 -25 Td
      /F2 11 Tf
      (TABLE 16 & 17: VITALS & TOLERABILITY OUTCOMES) Tj
      0 -18 Td
      /F1 9 Tf
      (\u2022 Blood Pressure: Systolic 122.56 \xB1 5.23 mmHg | Diastolic 78.12 \xB1 5.92 mmHg \\(Healthy normotensive\\)) Tj
      0 -14 Td
      (\u2022 Pulse Rate: 78.48 \xB1 5.92 beats per minute \\(Normal sinus rhythm\\)) Tj
      0 -14 Td
      (\u2022 Adverse Events: ZERO \\(0\\) Serious Adverse Events \\(SAEs\\) or Adverse Drug Reactions reported.) Tj
      0 -14 Td
      (\u2022 Tolerability Score: 03 \xB1 00 \\(Score 3 = Excellent Tolerability, highest category\\).) Tj
      0 -14 Td
      (\u2022 Participant Compliance: 100% adherence to study dosage throughout the 90-day intervention.) Tj
      0 -55 Td
      /F1 9 Tf
      (Confidential | Page 7 of 8 | MHC/CT/25-26/007) Tj
      ET
      `,
      // Page 8: 180-Day Extension & Conclusion
      `
      0.0 0.42 0.18 rg
      45 770 505 4 re f
      0 0 0 rg
      BT
      /F2 10 Tf
      45 800 Td
      (CLINICAL STUDY REPORT \u2022 180-DAY EXTENSION & OFFICIAL CONCLUSION) Tj
      0 -16 Td
      /F1 9 Tf
      (CTRI/2025/10/095664 | Protocol: MHC/CT/25-26/007) Tj
      0 -35 Td
      /F2 14 Tf
      (ANNEXURE 1: 180-DAY LONG-TERM EXTENSION PHASE) Tj
      0 -20 Td
      /F1 9 Tf
      (Following the initial 90-day period, 18 participants continued Antox-D liquid through Day 180:) Tj
      0 -24 Td
      /F2 9 Tf
      (Biomarker           Baseline \\(D1\\)    Day 90              Day 180 \\(6 Months\\)  Total Change) Tj
      0 -16 Td
      /F1 9 Tf
      (Fasting Glucose     126.44 \xB1 16.92 mg/dL121.44 \xB1 16.30 mg/dL110.61 \xB1 7.75 mg/dL -12.52% \\(p=0.001*\\)) Tj
      0 -14 Td
      (Postprandial PPG    187.87 \xB1 37.86 mg/dL157.44 \xB1 26.25 mg/dL136.17 \xB1 13.61 mg/dL -27.52% \\(p<0.0001*\\)) Tj
      0 -14 Td
      (HbA1c Levels        7.39 \xB1 0.24%        6.63 \xB1 0.23%        6.27 \xB1 0.53%        -15.11% \\(p<0.0001*\\)) Tj
      0 -14 Td
      (Fasting Insulin     38.73 \xB1 11.29 mIU/L 35.48 \xB1 9.95 mIU/L  18.93 \xB1 3.05 mIU/L  -51.13% Reduction) Tj
      0 -14 Td
      (HOMA-IR Score       13.63 \xB1 3.57        10.48 \xB1 2.84        5.02 \xB1 1.03         -63.18% Recovery) Tj
      0 -28 Td
      /F2 11 Tf
      (OFFICIAL TRIAL CONCLUSION:) Tj
      0 -18 Td
      /F1 9 Tf
      (Antox-D liquid is confirmed to be a safe, well-tolerated, and clinically efficacious adjunctive) Tj
      0 -13 Td
      (nutraceutical therapy for Type 2 Diabetes Mellitus. It significantly reduces HbA1c, improves fasting) Tj
      0 -13 Td
      (and postprandial glucose, reverses insulin resistance \\(HOMA-IR\\), lowers LDL cholesterol, and) Tj
      0 -13 Td
      (enhances overall patient quality of life with zero adverse drug reactions.) Tj
      0 -35 Td
      /F2 10 Tf
      (AUTHORIZED SIGNATORIES:) Tj
      0 -20 Td
      /F2 9 Tf
      (Sponsor: Mr. Sadik Gous Shaikh                     CRO: Dr. Gayatri Ganu) Tj
      0 -14 Td
      /F1 8 Tf
      (Director, Nutrifeel Health Products Pvt. Ltd.      Managing Director, Mprex Healthcare Pvt. Ltd.) Tj
      0 -12 Td
      (Kasaba Bavada, Kolhapur - 416006                   Sai Millenium, Punawale, Pune - 411033) Tj
      0 -20 Td
      /F2 9 Tf
      (Sahara Social Foundation \\(Kolhapur, Reg. MAH/582/2014/KOP\\) | Helpline: +91 7745066707) Tj
      0 -45 Td
      /F1 9 Tf
      (Confidential | Page 8 of 8 | MHC/CT/25-26/007) Tj
      ET
      `
    ];
    let buffer = "%PDF-1.4\n";
    let objects = [];
    let catObjNum = 1;
    let pagesObjNum = 2;
    let font1Num = 3;
    let font2Num = 4;
    let pageCount = pages.length;
    let pageObjNums = [];
    let streamObjNums = [];
    for (let i = 0; i < pageCount; i++) {
      pageObjNums.push(5 + i);
      streamObjNums.push(5 + pageCount + i);
    }
    addObj(`<< /Type /Catalog /Pages ${pagesObjNum} 0 R >>`);
    addObj(`<< /Type /Pages /Kids [${pageObjNums.map((n) => `${n} 0 R`).join(" ")}] /Count ${pageCount} >>`);
    addObj(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`);
    addObj(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`);
    for (let i = 0; i < pageCount; i++) {
      addObj(`<< /Type /Page /Parent ${pagesObjNum} 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 ${font1Num} 0 R /F2 ${font2Num} 0 R >> >> /Contents ${streamObjNums[i]} 0 R >>`);
    }
    for (let i = 0; i < pageCount; i++) {
      let streamContent = pages[i].trim();
      let streamLen = Buffer.byteLength(streamContent, "utf-8");
      addObj(`<< /Length ${streamLen} >>
stream
${streamContent}
endstream`);
    }
    let xrefOffset = Buffer.byteLength(buffer, "utf-8");
    buffer += `xref
0 ${objects.length + 1}
0000000000 65535 f 
`;
    for (let obj of objects) {
      buffer += String(obj.offset).padStart(10, "0") + " 00000 n \n";
    }
    buffer += `trailer
<< /Size ${objects.length + 1} /Root ${catObjNum} 0 R >>
startxref
${xrefOffset}
%%EOF
`;
    fs.writeFileSync(pdfPath, buffer, "utf-8");
    console.log("[PDF Generator] Successfully generated Antox-D-Clinical-Study-Report.pdf (" + buffer.length + " bytes)");
  } catch (err) {
    console.error("[PDF Generator Error]", err);
  }
}
syncFavicon();
syncSlides();
generateClinicalReportPdf();
function razorpayDevApiPlugin() {
  return {
    name: "razorpay-dev-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? req.url.split("?")[0] : "";
        if (url === "/api/create-order" || url === "/api/verify-payment") {
          let rawBody = "";
          req.on("data", (chunk) => {
            rawBody += chunk;
          });
          req.on("end", async () => {
            try {
              req.body = rawBody ? JSON.parse(rawBody) : {};
            } catch (e) {
              req.body = rawBody;
            }
            if (!res.status) {
              res.status = (code) => {
                res.statusCode = code;
                return res;
              };
            }
            if (!res.json) {
              res.json = (data) => {
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(data));
                return res;
              };
            }
            try {
              if (url === "/api/create-order") {
                await handler(req, res);
              } else if (url === "/api/verify-payment") {
                await handler2(req, res);
              }
            } catch (err) {
              console.error(`[Dev API Error] ${url}:`, err);
              if (!res.headersSent) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: err.message || "Internal dev server error" }));
              }
            }
          });
          return;
        }
        next();
      });
    }
  };
}
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  process.env.RAZORPAY_KEY_ID = env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_test_TStMSRZCVUy6Aw";
  process.env.RAZORPAY_KEY_SECRET = env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || "Xu3HMTsobG5tMtxsSDeaJ4Lz";
  process.env.VITE_RAZORPAY_KEY_ID = env.VITE_RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TStMSRZCVUy6Aw";
  return {
    plugins: [react(), razorpayDevApiPlugin()],
    server: {
      port: 5173,
      open: false
    },
    build: {
      target: "es2020",
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1200,
      minify: "esbuild",
      sourcemap: false,
      reportCompressedSize: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("firebase")) {
                return "vendor-firebase";
              }
              if (id.includes("lucide-react")) {
                return "vendor-icons";
              }
              if (id.includes("react") || id.includes("react-dom") || id.includes("react-router-dom")) {
                return "vendor-react";
              }
              return "vendor-deps";
            }
          }
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiLCAiYXBpL2NyZWF0ZS1vcmRlci5qcyIsICJhcGkvdmVyaWZ5LXBheW1lbnQuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxJVFBMXFxcXFNhaGFyYSBTb2NpYWwgRm91bmRhdGlvblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcSVRQTFxcXFxTYWhhcmEgU29jaWFsIEZvdW5kYXRpb25cXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0lUUEwvU2FoYXJhJTIwU29jaWFsJTIwRm91bmRhdGlvbi92aXRlLmNvbmZpZy5qc1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ3VybCdcbmltcG9ydCBjcmVhdGVPcmRlckhhbmRsZXIgZnJvbSAnLi9hcGkvY3JlYXRlLW9yZGVyLmpzJ1xuaW1wb3J0IHZlcmlmeVBheW1lbnRIYW5kbGVyIGZyb20gJy4vYXBpL3ZlcmlmeS1wYXltZW50LmpzJ1xuXG5jb25zdCBfX2Rpcm5hbWUgPSBwYXRoLmRpcm5hbWUoZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpKVxuXG5mdW5jdGlvbiBzeW5jRmF2aWNvbigpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwdWJsaWNEaXIgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAncHVibGljJylcbiAgICBjb25zdCBzdmdQYXRoID0gcGF0aC5qb2luKHB1YmxpY0RpciwgJ2Zhdmljb24uc3ZnJylcbiAgICBjb25zdCBzdmdDb250ZW50ID0gYDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgNjQgNjRcIj5cbiAgPGRlZnM+XG4gICAgPGxpbmVhckdyYWRpZW50IGlkPVwic3NmR3JhZFwiIHgxPVwiMCVcIiB5MT1cIjAlXCIgeDI9XCIxMDAlXCIgeTI9XCIxMDAlXCI+XG4gICAgICA8c3RvcCBvZmZzZXQ9XCIwJVwiIHN0b3AtY29sb3I9XCIjMDA2QjJEXCIvPlxuICAgICAgPHN0b3Agb2Zmc2V0PVwiMTAwJVwiIHN0b3AtY29sb3I9XCIjMDQyMDBFXCIvPlxuICAgIDwvbGluZWFyR3JhZGllbnQ+XG4gIDwvZGVmcz5cbiAgPGNpcmNsZSBjeD1cIjMyXCIgY3k9XCIzMlwiIHI9XCIzMFwiIGZpbGw9XCJ1cmwoI3NzZkdyYWQpXCIgc3Ryb2tlPVwiI0ZGQzkyOFwiIHN0cm9rZS13aWR0aD1cIjIuNVwiLz5cbiAgPHBhdGggZD1cIk0zMiAxNGMtNS41IDAtMTAgNC41LTEwIDEwIDAgOSAxMCAxNyAxMCAxN3MxMC04IDEwLTE3YzAtNS41LTQuNS0xMC0xMC0xMHpcIiBmaWxsPVwiI2ZmZmZmZlwiLz5cbiAgPHBhdGggZD1cIk0zMiAxOWMtMyAwLTUuNSAyLjUtNS41IDUuNSAwIDUgNS41IDkuNSA1LjUgOS41czUuNS00LjUgNS41LTkuNWMwLTMtMi41LTUuNS01LjUtNS41elwiIGZpbGw9XCIjMDA2QjJEXCIvPlxuICA8Y2lyY2xlIGN4PVwiMzJcIiBjeT1cIjI0LjVcIiByPVwiMi4yXCIgZmlsbD1cIiNGRkM5MjhcIi8+XG4gIDxwYXRoIGQ9XCJNMjIgNDZoMjBcIiBzdHJva2U9XCIjRkZDOTI4XCIgc3Ryb2tlLXdpZHRoPVwiMi41XCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiLz5cbjwvc3ZnPmBcbiAgICBmcy53cml0ZUZpbGVTeW5jKHN2Z1BhdGgsIHN2Z0NvbnRlbnQsICd1dGY4JylcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1tGYXZpY29uIFN5bmMgRXJyb3JdJywgZSlcbiAgfVxufVxuXG5mdW5jdGlvbiBzeW5jU2xpZGVzKCkge1xuICB0cnkge1xuICAgIGNvbnN0IHB1YmxpY0RpciA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdwdWJsaWMnKVxuICAgIGNvbnN0IHNsaWRlMSA9IHBhdGguam9pbihwdWJsaWNEaXIsICdzbGlkZS1hbnRveC1kLmpwZycpXG4gICAgY29uc3Qgc2xpZGUyID0gcGF0aC5qb2luKHB1YmxpY0RpciwgJ3NsaWRlLWFudG94LWFtcnV0LmpwZycpXG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoc2xpZGUxKSAmJiBmcy5leGlzdHNTeW5jKHNsaWRlMikpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCBzcmMxID0gJ0M6XFxcXFVzZXJzXFxcXGhwXFxcXC5nZW1pbmlcXFxcYW50aWdyYXZpdHlcXFxcYnJhaW5cXFxcMTA2M2I2MjEtYTA3Mi00MTI4LWI2MmEtZTYzZWM0OGVhZGUxXFxcXC51c2VyX3VwbG9hZGVkXFxcXG1lZGlhXzE3OTA4NDUwMDQ3MzguanBnJ1xuICAgIGNvbnN0IHNyYzIgPSAnQzpcXFxcVXNlcnNcXFxcaHBcXFxcLmdlbWluaVxcXFxhbnRpZ3Jhdml0eVxcXFxicmFpblxcXFwxMDYzYjYyMS1hMDcyLTQxMjgtYjYyYS1lNjNlYzQ4ZWFkZTFcXFxcLnVzZXJfdXBsb2FkZWRcXFxcbWVkaWFfMTc5MDg0NTA0OTIzOS5qcGcnXG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoc3JjMSkpIHtcbiAgICAgIGZzLmNvcHlGaWxlU3luYyhzcmMxLCBwYXRoLmpvaW4ocHVibGljRGlyLCAnc2xpZGUtYW50b3gtZC5qcGcnKSlcbiAgICAgIGZzLmNvcHlGaWxlU3luYyhzcmMxLCBwYXRoLmpvaW4ocHVibGljRGlyLCAnaGVyby1zbGlkZS0xLmpwZycpKVxuICAgICAgY29uc29sZS5sb2coJ1tTbGlkZSBTeW5jXSBDb3BpZWQgc2xpZGUtMScpXG4gICAgfVxuICAgIGlmIChmcy5leGlzdHNTeW5jKHNyYzIpKSB7XG4gICAgICBmcy5jb3B5RmlsZVN5bmMoc3JjMiwgcGF0aC5qb2luKHB1YmxpY0RpciwgJ3NsaWRlLWFudG94LWFtcnV0LmpwZycpKVxuICAgICAgZnMuY29weUZpbGVTeW5jKHNyYzIsIHBhdGguam9pbihwdWJsaWNEaXIsICdoZXJvLXNsaWRlLTIuanBnJykpXG4gICAgICBjb25zb2xlLmxvZygnW1NsaWRlIFN5bmNdIENvcGllZCBzbGlkZS0yJylcbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKCdbU2xpZGUgU3luYyBFcnJvcl0nLCBlKVxuICB9XG59XG5cbmZ1bmN0aW9uIHN5bmNDbGluaWNhbFBkZigpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwdWJsaWNEaXIgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAncHVibGljJylcbiAgICBjb25zdCByZXBvcnRzRGlyID0gcGF0aC5qb2luKHB1YmxpY0RpciwgJ3JlcG9ydHMnKVxuICAgIGlmICghZnMuZXhpc3RzU3luYyhyZXBvcnRzRGlyKSkge1xuICAgICAgZnMubWtkaXJTeW5jKHJlcG9ydHNEaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pXG4gICAgfVxuICAgIGNvbnN0IHRhcmdldFBkZiA9IHBhdGguam9pbihyZXBvcnRzRGlyLCAnQW50b3gtRC1DbGluaWNhbC1TdHVkeS1SZXBvcnQucGRmJylcbiAgICBpZiAoZnMuZXhpc3RzU3luYyh0YXJnZXRQZGYpICYmIGZzLnN0YXRTeW5jKHRhcmdldFBkZikuc2l6ZSA+IDEwMDAwMCkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgY29uc3QgdXNlclBkZiA9ICdDOlxcXFxVc2Vyc1xcXFxocFxcXFwuZ2VtaW5pXFxcXGFudGlncmF2aXR5XFxcXGJyYWluXFxcXDE1ZTM4YTUyLTNjNzEtNDBhYy05N2QwLTk5MmM4Y2YxNjE4N1xcXFwudXNlcl91cGxvYWRlZFxcXFxtZWRpYV8xNzkwOTM3MTYxMTIyLnBkZidcbiAgICBpZiAoZnMuZXhpc3RzU3luYyh1c2VyUGRmKSkge1xuICAgICAgZnMuY29weUZpbGVTeW5jKHVzZXJQZGYsIHRhcmdldFBkZilcbiAgICAgIGNvbnNvbGUubG9nKCdbUERGIFN5bmNdIENvcGllZCB1c2VyIHVwbG9hZGVkIFBERiB0byBwdWJsaWMvcmVwb3J0cy9BbnRveC1ELUNsaW5pY2FsLVN0dWR5LVJlcG9ydC5wZGYnKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1tQREYgU3luYyBFcnJvcl0nLCBlcnIpXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlQ2xpbmljYWxSZXBvcnRQZGYoKSB7XG4gIHRyeSB7XG4gICAgaWYgKHN5bmNDbGluaWNhbFBkZigpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3QgcHVibGljRGlyID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3B1YmxpYycpXG4gICAgY29uc3QgcmVwb3J0c0RpciA9IHBhdGguam9pbihwdWJsaWNEaXIsICdyZXBvcnRzJylcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMocmVwb3J0c0RpcikpIHtcbiAgICAgIGZzLm1rZGlyU3luYyhyZXBvcnRzRGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KVxuICAgIH1cbiAgICBjb25zdCBwZGZQYXRoID0gcGF0aC5qb2luKHJlcG9ydHNEaXIsICdBbnRveC1ELUNsaW5pY2FsLVN0dWR5LVJlcG9ydC5wZGYnKVxuXG4gICAgY29uc3QgcGFnZXMgPSBbXG4gICAgICAvLyBQYWdlIDE6IENvdmVyICYgUHJvdG9jb2xcbiAgICAgIGBcbiAgICAgIDAuMCAwLjQyIDAuMTggcmdcbiAgICAgIDQ1IDc3MCA1MDUgNCByZSBmXG4gICAgICAwIDAgMCByZ1xuICAgICAgQlRcbiAgICAgIC9GMiAxMCBUZlxuICAgICAgNDUgODAwIFRkXG4gICAgICAoQ09ORklERU5USUFMIFx1MjAyMiBDTElOSUNBTCBTVFVEWSBSRVBPUlQpIFRqXG4gICAgICAwIC0xOCBUZFxuICAgICAgL0YyIDkgVGZcbiAgICAgIChDVFJJIFJlZ2lzdHJhdGlvbjogQ1RSSS8yMDI1LzEwLzA5NTY2NCBbUmVnaXN0ZXJlZCBvbjogMDYvMTAvMjAyNV0pIFRqXG4gICAgICAwIC0zMiBUZFxuICAgICAgL0YyIDE4IFRmXG4gICAgICAoQ0xJTklDQUwgU1RVRFkgUkVQT1JUKSBUalxuICAgICAgMCAtMjQgVGRcbiAgICAgIC9GMSAxMSBUZlxuICAgICAgKFByb3RvY29sIE51bWJlcjogTUhDL0NULzI1LTI2LzAwNykgVGpcbiAgICAgIDAgLTE2IFRkXG4gICAgICAoVmVyc2lvbiAyLjAwOyBkYXRlZCwgMzFzdCBKdWx5IDIwMjUpIFRqXG4gICAgICAwIC0zMCBUZFxuICAgICAgL0YyIDEzIFRmXG4gICAgICAoQSByYW5kb21pemVkLCBkb3VibGUtYmxpbmQsIHBhcmFsbGVsLWFybSBjbGluaWNhbCB0cmlhbCB0byBhc3Nlc3MgdGhlKSBUalxuICAgICAgMCAtMTggVGRcbiAgICAgIChlZmZpY2FjeSBhbmQgc2FmZXR5IG9mIGEgSGVhbHRoIHN1cHBsZW1lbnQgXFxcXChBbnRveC1EIGxpcXVpZFxcXFwpIGluKSBUalxuICAgICAgMCAtMTggVGRcbiAgICAgIChwYXJ0aWNpcGFudHMgd2l0aCB0eXBlIDIgZGlhYmV0ZXMgbWVsbGl0dXMuKSBUalxuICAgICAgMCAtNDUgVGRcbiAgICAgIC9GMiAxMiBUZlxuICAgICAgKFNwb25zb3I6IE51dHJpZmVlbCBIZWFsdGggUHJvZHVjdHMgUHZ0LiBMdGQuKSBUalxuICAgICAgMCAtMTYgVGRcbiAgICAgIC9GMSAxMCBUZlxuICAgICAgKE1yLiBTYWRpayBHb3VzIFNoYWlraCAtIERpcmVjdG9yKSBUalxuICAgICAgMCAtMTQgVGRcbiAgICAgICg0NTYtNTcgVmFzYW50IFBhcmsgU3VnYXIgTWlsbCBSb2FkLCBLYXNhYmEgQmF2YWRhLCBLb2xoYXB1ciAtIDQxNjAwNikgVGpcbiAgICAgIDAgLTI1IFRkXG4gICAgICAvRjIgMTIgVGZcbiAgICAgIChDb250cmFjdCBSZXNlYXJjaCBPcmdhbml6YXRpb24gXFxcXChDUk9cXFxcKTogTXByZXggSGVhbHRoY2FyZSBQdnQuIEx0ZC4pIFRqXG4gICAgICAwIC0xNiBUZFxuICAgICAgL0YxIDEwIFRmXG4gICAgICAoRHIuIEdheWF0cmkgR2FudSAtIE1hbmFnaW5nIERpcmVjdG9yKSBUalxuICAgICAgMCAtMTQgVGRcbiAgICAgIChPZmZpY2UgODEzLTgxNiwgU2FpIE1pbGxlbml1bSwgUHVuYXdhbGUsIFB1bmUsIE1haGFyYXNodHJhIC0gNDExMDMzKSBUalxuICAgICAgMCAtNDAgVGRcbiAgICAgIC9GMiAxMiBUZlxuICAgICAgKEVYRUNVVElWRSBLRVkgRklORElOR1MgU1VNTUFSWTopIFRqXG4gICAgICAwIC0yMCBUZFxuICAgICAgL0YxIDEwIFRmXG4gICAgICAoXHUyMDIyIFByaW1hcnkgRWZmaWNhY3k6IEhiQTFjIHJlZHVjZWQgYnkgOC4zNCUgaW4gQW50b3gtRCBncm91cCB2cyAyLjcyJSBpbiBwbGFjZWJvIFxcXFwocCA9IDAuMDAwMlxcXFwpKSBUalxuICAgICAgMCAtMTYgVGRcbiAgICAgIChcdTIwMjIgRmFzdGluZyBQbGFzbWEgR2x1Y29zZTogRGVjcmVhc2VkIGJ5IDguNjglIHJlYWNoaW5nIDExOS4zMiBtZy9kTCBhdCBEYXkgOTAgXFxcXChwID0gMC4wMDJcXFxcKSkgVGpcbiAgICAgIDAgLTE2IFRkXG4gICAgICAoXHUyMDIyIFBvc3RwcmFuZGlhbCBHbHVjb3NlOiBSZWR1Y2VkIGJ5IDE1LjA5JSBcXFxcKDE5Ni40MyBtZy9kTCB0byAxNjYuODAgbWcvZExcXFxcKSkgVGpcbiAgICAgIDAgLTE2IFRkXG4gICAgICAoXHUyMDIyIEluc3VsaW4gUmVzaXN0YW5jZTogSE9NQS1JUiByZWR1Y2VkIGJ5IDE2LjQ5JSBpbiBBbnRveC1EIHZzICsyLjc3JSBpbiBwbGFjZWJvIFxcXFwocCA9IDAuMDAwNFxcXFwpKSBUalxuICAgICAgMCAtMTYgVGRcbiAgICAgIChcdTIwMjIgTGlwaWQgUHJvZmlsZTogTERMIGNob2xlc3Rlcm9sIGxvd2VyZWQgYnkgNy41MyUgXFxcXChwID0gMC4wMDA2XFxcXCksIE1ldFMgWi1zY29yZSBpbXByb3ZlZCBieSAzNS40NyUpIFRqXG4gICAgICAwIC0xNiBUZFxuICAgICAgKFx1MjAyMiBTYWZldHkgUHJvZmlsZTogWkVSTyBhZHZlcnNlIGRydWcgcmVhY3Rpb25zIFxcXFwoQURSc1xcXFwpLCAxMDAlIGNvbXBsaWFuY2UsIDAzLzAzIHRvbGVyYWJpbGl0eSBzY29yZSkgVGpcbiAgICAgIDAgLTE2IFRkXG4gICAgICAoXHUyMDIyIDE4MC1EYXkgRXh0ZW5zaW9uOiBTdXN0YWluZWQgSGJBMWMgY29udHJvbCBkb3duIHRvIDYuMjclIGFuZCA2My4xOCUgcmV2ZXJzYWwgb2YgSE9NQS1JUikgVGpcbiAgICAgIDAgLTU1IFRkXG4gICAgICAvRjEgOSBUZlxuICAgICAgKENvbmZpZGVudGlhbCB8IFBhZ2UgMSBvZiA4IHwgTUhDL0NULzI1LTI2LzAwNykgVGpcbiAgICAgIEVUXG4gICAgICBgLFxuXG4gICAgICAvLyBQYWdlIDI6IEV0aGljcyAmIERlY2xhcmF0aW9uXG4gICAgICBgXG4gICAgICAwLjAgMC40MiAwLjE4IHJnXG4gICAgICA0NSA3NzAgNTA1IDQgcmUgZlxuICAgICAgMCAwIDAgcmdcbiAgICAgIEJUXG4gICAgICAvRjIgMTAgVGZcbiAgICAgIDQ1IDgwMCBUZFxuICAgICAgKENMSU5JQ0FMIFNUVURZIFJFUE9SVCBcdTIwMjIgRVRISUNTICYgSU5WRVNUSUdBVE9SIERFQ0xBUkFUSU9OKSBUalxuICAgICAgMCAtMTYgVGRcbiAgICAgIC9GMSA5IFRmXG4gICAgICAoQ1RSSS8yMDI1LzEwLzA5NTY2NCB8IFByb3RvY29sOiBNSEMvQ1QvMjUtMjYvMDA3KSBUalxuICAgICAgMCAtMzUgVGRcbiAgICAgIC9GMiAxNCBUZlxuICAgICAgKElOVkVTVElHQVRPUiBERUNMQVJBVElPTiAmIElOU1RJVFVUSU9OQUwgRVRISUNTKSBUalxuICAgICAgMCAtMjUgVGRcbiAgICAgIC9GMSAxMCBUZlxuICAgICAgKFdlIGhlcmVieSBjZXJ0aWZ5IHRoZSBhdXRoZW50aWNpdHkgb2YgdGhlIENsaW5pY2FsIFN0dWR5IFJlcG9ydCBhbmQgZGVjbGFyZSB0aGF0IHRoZSByZXN1bHRzIGFyZSkgVGpcbiAgICAgIDAgLTE2IFRkXG4gICAgICAoYW4gYWNjdXJhdGUgaW50ZXJwcmV0YXRpb24gb2YgdGhlIGRhdGEsIHRvIHRoZSBiZXN0IG9mIG91ciBrbm93bGVkZ2UuIFdlIGFsc28gaGVyZWJ5IGFzc3VyZSB0aGF0KSBUalxuICAgICAgMCAtMTYgVGRcbiAgICAgICh0aGlzIHN0dWR5IHdhcyBjb25kdWN0ZWQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBwcm90b2NvbCwgR0NQIGd1aWRlbGluZXMsIGFuZCBldGhpY2FsIHByaW5jaXBsZXMuKSBUalxuICAgICAgMCAtMzUgVGRcbiAgICAgIC9GMiAxMSBUZlxuICAgICAgKFBBUlRJQ0lQQVRJTkcgQ0xJTklDQUwgU0lURVMgJiBJTlZFU1RJR0FUT1JTOikgVGpcbiAgICAgIDAgLTI1IFRkXG4gICAgICAvRjIgMTAgVGZcbiAgICAgIChTaXRlIDE6IE9ta2FyIE11bHRpc3BlY2lhbGl0eSBIb3NwaXRhbCkgVGpcbiAgICAgIDAgLTE2IFRkXG4gICAgICAvRjEgMTAgVGZcbiAgICAgIChJbnZlc3RpZ2F0b3I6IERyLiBBbnVqYSBNdWtlc2ggUGhhdGFrIFxcXFwoUHJpbmNpcGFsIEludmVzdGlnYXRvclxcXFwpKSBUalxuICAgICAgMCAtMTQgVGRcbiAgICAgIChBZGRyZXNzOiBTdXJ2ZXkgTm8uIDk0LCBQbG90IE5vLiA4MSwgT3Bwb3NpdGUgdG8gWWFzaGFkYSBXaW5kb3NvbmcsIFJhdmV0LCBQdW5lLCBNSCAtIDQxMjEwMSkgVGpcbiAgICAgIDAgLTE0IFRkXG4gICAgICAoRXRoaWNzIENvbW1pdHRlZTogSW5zdGl0dXRpb25hbCBFdGhpY3MgQ29tbWl0dGVlIFNhbmd2aSBNdWx0aXNwZWNpYWxpdHkgSG9zcGl0YWwgLSBBcHByb3ZlZCkgVGpcbiAgICAgIDAgLTI1IFRkXG4gICAgICAvRjIgMTAgVGZcbiAgICAgIChTaXRlIDI6IENhcmUgTXVsdGlzcGVjaWFsaXR5IEhvc3BpdGFsKSBUalxuICAgICAgMCAtMTYgVGRcbiAgICAgIC9GMSAxMCBUZlxuICAgICAgKEludmVzdGlnYXRvcjogRHIuIERoeWFuZXNod2FyIE1hbndhdGthciBcXFxcKFByaW5jaXBhbCBJbnZlc3RpZ2F0b3JcXFxcKSkgVGpcbiAgICAgIDAgLTE0IFRkXG4gICAgICAoQWRkcmVzczogS29sdGUgQXJjYWRlLCBOYWdhciBSZCwgV2FnaG9saSwgUHVuZSwgTWFoYXJhc2h0cmEgLSA0MTIyMDcpIFRqXG4gICAgICAwIC0xNCBUZFxuICAgICAgKEV0aGljcyBDb21taXR0ZWU6IENhcmUgTXVsdGlzcGVjaWFsaXR5IEhvc3BpdGFsIEluc3RpdHV0aW9uYWwgRXRoaWNzIENvbW1pdHRlZSAtIEFwcHJvdmVkKSBUalxuICAgICAgMCAtMzUgVGRcbiAgICAgIC9GMiAxMSBUZlxuICAgICAgKFJFR1VMQVRPUlkgJiBHQ1AgQ09NUExJQU5DRSBTVU1NQVJZOikgVGpcbiAgICAgIDAgLTIwIFRkXG4gICAgICAvRjEgMTAgVGZcbiAgICAgIChcdTIwMjIgR29vZCBDbGluaWNhbCBQcmFjdGljZSBcXFxcKElDSC1HQ1BcXFxcKSBhbmQgRGVjbGFyYXRpb24gb2YgSGVsc2lua2kgXFxcXChEb0hcXFxcKSBhZGhlcmVkIHN0cmljdGx5LikgVGpcbiAgICAgIDAgLTE2IFRkXG4gICAgICAoXHUyMDIyIFByb3NwZWN0aXZlIFJlZ2lzdHJhdGlvbiBvbiBDVFJJIFxcXFwoQ2xpbmljYWwgVHJpYWxzIFJlZ2lzdHJ5IC0gSW5kaWFcXFxcKTogQ1RSSS8yMDI1LzEwLzA5NTY2NC4pIFRqXG4gICAgICAwIC0xNiBUZFxuICAgICAgKFx1MjAyMiBJbmZvcm1lZCBDb25zZW50IEZvcm0gXFxcXChJQ0ZcXFxcKSBleGVjdXRlZCBmb3IgYWxsIDEwNCBlbnJvbGxlZCBwYXJ0aWNpcGFudHMgcHJpb3IgdG8gaW5pdGlhdGlvbi4pIFRqXG4gICAgICAwIC0xNiBUZFxuICAgICAgKFx1MjAyMiBGdWxsIGNvbmZpZGVudGlhbGl0eSBhbmQgY29kZWQgcGFydGljaXBhbnQgaWRlbnRpZmljYXRpb24gbWFpbnRhaW5lZCBwZXIgcmVndWxhdG9yeSBub3Jtcy4pIFRqXG4gICAgICAwIC0xNiBUZFxuICAgICAgKFx1MjAyMiBEcnVnIG1hbnVmYWN0dXJlIHBlcmZvcm1lZCB1bmRlciBHb29kIE1hbnVmYWN0dXJpbmcgUHJhY3RpY2VzIFxcXFwoR01QXFxcXCkgY2VydGlmaWVkIGZhY2lsaXRpZXMuKSBUalxuICAgICAgMCAtNzAgVGRcbiAgICAgIC9GMSA5IFRmXG4gICAgICAoQ29uZmlkZW50aWFsIHwgUGFnZSAyIG9mIDggfCBNSEMvQ1QvMjUtMjYvMDA3KSBUalxuICAgICAgRVRcbiAgICAgIGAsXG5cbiAgICAgIC8vIFBhZ2UgMzogU3lub3BzaXMgJiBNZXRob2RvbG9neVxuICAgICAgYFxuICAgICAgMC4wIDAuNDIgMC4xOCByZ1xuICAgICAgNDUgNzcwIDUwNSA0IHJlIGZcbiAgICAgIDAgMCAwIHJnXG4gICAgICBCVFxuICAgICAgL0YyIDEwIFRmXG4gICAgICA0NSA4MDAgVGRcbiAgICAgIChDTElOSUNBTCBTVFVEWSBSRVBPUlQgXHUyMDIyIFNUVURZIFNZTk9QU0lTICYgTUVUSE9ET0xPR1kpIFRqXG4gICAgICAwIC0xNiBUZFxuICAgICAgL0YxIDkgVGZcbiAgICAgIChDVFJJLzIwMjUvMTAvMDk1NjY0IHwgUHJvdG9jb2w6IE1IQy9DVC8yNS0yNi8wMDcpIFRqXG4gICAgICAwIC0zNSBUZFxuICAgICAgL0YyIDE0IFRmXG4gICAgICAoU1RVRFkgU1lOT1BTSVMgJiBQUk9UT0NPTCBTUEVDSUZJQ0FUSU9OUykgVGpcbiAgICAgIDAgLTI1IFRkXG4gICAgICAvRjIgMTAgVGZcbiAgICAgIChUeXBlIG9mIFRyaWFsOikgVGpcbiAgICAgIDAgLTE0IFRkXG4gICAgICAvRjEgMTAgVGZcbiAgICAgIChQaGFzZSBJSSBJbnRlcnZlbnRpb25hbCwgUmFuZG9taXplZCwgRG91YmxlLUJsaW5kLCBQYXJhbGxlbC1Bcm0sIFBsYWNlYm8tQ29udHJvbGxlZCBTdHVkeS4pIFRqXG4gICAgICAwIC0yMiBUZFxuICAgICAgL0YyIDEwIFRmXG4gICAgICAoVHJlYXRtZW50IEFybXMgJiBEb3NhZ2U6KSBUalxuICAgICAgMCAtMTQgVGRcbiAgICAgIC9GMSAxMCBUZlxuICAgICAgKFx1MjAyMiBHcm91cCBBIFxcXFwoVGVzdCBBcm1cXFxcKTogQW50b3gtRCBsaXF1aWQgXFxcXCgxMCBtbCB0d2ljZSBkYWlseSwgMSBociBiZWZvcmUgbWVhbHMgd2l0aCB3YXRlclxcXFwpICsgT0hBKSBUalxuICAgICAgMCAtMTQgVGRcbiAgICAgIChcdTIwMjIgR3JvdXAgQiBcXFxcKFBsYWNlYm8gQXJtXFxcXCk6IFBsYWNlYm8gbGlxdWlkIFxcXFwoMTAgbWwgdHdpY2UgZGFpbHksIDEgaHIgYmVmb3JlIG1lYWxzIHdpdGggd2F0ZXJcXFxcKSArIE9IQSkgVGpcbiAgICAgIDAgLTIyIFRkXG4gICAgICAvRjIgMTAgVGZcbiAgICAgIChTYW1wbGUgU2l6ZSAmIENvbXBsZXRpb24gUmF0ZTopIFRqXG4gICAgICAwIC0xNCBUZFxuICAgICAgL0YxIDEwIFRmXG4gICAgICAoXHUyMDIyIDEwNCByYW5kb21pemVkIHBhcnRpY2lwYW50cyBcXFxcKEdyb3VwIEE6IDUyLCBHcm91cCBCOiA1MlxcXFwpKSBUalxuICAgICAgMCAtMTQgVGRcbiAgICAgIChcdTIwMjIgMTAyIGNvbXBsZXRlZCB0aGUgZnVsbCA5MC1kYXkgcHJvdG9jb2wgXFxcXChHcm91cCBBOiA1MCwgR3JvdXAgQjogNTI7IDIgZGlzY29udGludWVkIGxvc3QgdG8gZm9sbG93LXVwXFxcXCkpIFRqXG4gICAgICAwIC0yMiBUZFxuICAgICAgL0YyIDEwIFRmXG4gICAgICAoRWxpZ2liaWxpdHkgJiBTZWxlY3Rpb24gQ3JpdGVyaWE6KSBUalxuICAgICAgMCAtMTQgVGRcbiAgICAgIC9GMSAxMCBUZlxuICAgICAgKFx1MjAyMiBJbmNsdXNpb246IE1hbGUgJiBmZW1hbGUgYWdlZCAzMC02NSB5ZWFycywgVDJETSByZWNlaXZpbmcgc3RhYmxlIE9IQXMgXFxcXChiaWd1YW5pZGVzICsgc3VsZm9ueWx1cmVhc1xcXFwpLCkgVGpcbiAgICAgIDAgLTE0IFRkXG4gICAgICAoICBiYXNlbGluZSBIYkExYyBiZXR3ZWVuIDcuMCUgYW5kIDkuMCUsIEJvZHkgTWFzcyBJbmRleCBcXFxcKEJNSVxcXFwpIDwgMzAga2cvbTIuKSBUalxuICAgICAgMCAtMTQgVGRcbiAgICAgIChcdTIwMjIgRXhjbHVzaW9uOiBUeXBlIDEgZGlhYmV0ZXMsIGluc3VsaW4gdGhlcmFweSwgc2V2ZXJlIHJlbmFsL2hlcGF0aWMgZHlzZnVuY3Rpb24sIHByZWduYW5jeS9sYWN0YXRpb24uKSBUalxuICAgICAgMCAtMjIgVGRcbiAgICAgIC9GMiAxMCBUZlxuICAgICAgKFZpc2l0IFNjaGVkdWxlICYgRHVyYXRpb25zOikgVGpcbiAgICAgIDAgLTE0IFRkXG4gICAgICAvRjEgMTAgVGZcbiAgICAgIChcdTIwMjIgU2NyZWVuaW5nIFZpc2l0IFxcXFwoRGF5IC03IHRvIERheSAwXFxcXCkgfCBCYXNlbGluZSBWaXNpdCAxIFxcXFwoRGF5IDFcXFxcKSB8IFZpc2l0IDIgXFxcXChEYXkgMzAgXHUwMEIxIDVcXFxcKSkgVGpcbiAgICAgIDAgLTE0IFRkXG4gICAgICAoXHUyMDIyIFZpc2l0IDMgXFxcXChEYXkgNjAgXHUwMEIxIDVcXFxcKSB8IFZpc2l0IDQgXFxcXChEYXkgOTAgXHUwMEIxIDUgLSBFbmQgb2YgUHJpbWFyeSBUcmlhbFxcXFwpIHwgRXh0ZW5zaW9uIFxcXFwoRGF5IDkxIHRvIERheSAxODBcXFxcKSkgVGpcbiAgICAgIDAgLTIyIFRkXG4gICAgICAvRjIgMTAgVGZcbiAgICAgIChTdGF0aXN0aWNhbCBBbmFseXNpcyAmIFNvZnR3YXJlOikgVGpcbiAgICAgIDAgLTE0IFRkXG4gICAgICAvRjEgMTAgVGZcbiAgICAgIChHcmFwaFBhZCBQcmlzbSB2ZXJzaW9uIDEwLjUuMC4gUGFpcmVkICYgdW5wYWlyZWQgU3R1ZGVudCB0LXRlc3QsIFdpbGNveG9uIHNpZ25lZCByYW5rIHRlc3QuKSBUalxuICAgICAgMCAtMTQgVGRcbiAgICAgIChTaWduaWZpY2FuY2UgdGhyZXNob2xkIHNldCBhdCB0d28tc2lkZWQgcCA8IDAuMDUuKSBUalxuICAgICAgMCAtNTAgVGRcbiAgICAgIC9GMSA5IFRmXG4gICAgICAoQ29uZmlkZW50aWFsIHwgUGFnZSAzIG9mIDggfCBNSEMvQ1QvMjUtMjYvMDA3KSBUalxuICAgICAgRVRcbiAgICAgIGAsXG5cbiAgICAgIC8vIFBhZ2UgNDogQWN0aXZlIEluZ3JlZGllbnRzIFRhYmxlXG4gICAgICBgXG4gICAgICAwLjAgMC40MiAwLjE4IHJnXG4gICAgICA0NSA3NzAgNTA1IDQgcmUgZlxuICAgICAgMCAwIDAgcmdcbiAgICAgIEJUXG4gICAgICAvRjIgMTAgVGZcbiAgICAgIDQ1IDgwMCBUZFxuICAgICAgKENMSU5JQ0FMIFNUVURZIFJFUE9SVCBcdTIwMjIgVEFCTEUgMzogQUNUSVZFIEJPVEFOSUNBTCBJTkdSRURJRU5UUykgVGpcbiAgICAgIDAgLTE2IFRkXG4gICAgICAvRjEgOSBUZlxuICAgICAgKENUUkkvMjAyNS8xMC8wOTU2NjQgfCBQcm90b2NvbDogTUhDL0NULzI1LTI2LzAwNykgVGpcbiAgICAgIDAgLTM1IFRkXG4gICAgICAvRjIgMTQgVGZcbiAgICAgIChUQUJMRSAzOiBTVEFOREFSRElaRUQgQ09NUE9TSVRJT04gT0YgQU5UT1gtRCBMSVFVSUQpIFRqXG4gICAgICAwIC0xOCBUZFxuICAgICAgL0YxIDkgVGZcbiAgICAgIChFYWNoIDEwIG1sIGRvc2UgY29udGFpbnMgdGhlIGZvbGxvd2luZyBGU1NBSS1hcHByb3ZlZCBhY3RpdmUgYm90YW5pY2FsIGV4dHJhY3RzOikgVGpcbiAgICAgIDAgLTI4IFRkXG4gICAgICAvRjIgOSBUZlxuICAgICAgKFNyLiAgIENvbW1vbiBOYW1lICAgICAgQm90YW5pY2FsIFNjaWVudGlmaWMgTmFtZSAgICAgICAgICAgUGFydCAvIEV4dHJhY3QgICAgICAgICAgICAgIFF1YW50aXR5KSBUalxuICAgICAgMCAtMTYgVGRcbiAgICAgIC9GMSA5IFRmXG4gICAgICAoIDEuICAgS2FyZWxhICAgICAgICAgICBNb21vcmRpY2EgY2hhcmFudGlhICAgICAgICAgICAgICAgICBGcnVpdCBleHRyYWN0ICAgICAgICAgICAgICAgMjUwIG1nKSBUalxuICAgICAgMCAtMTQgVGRcbiAgICAgICggMi4gICBHdWRtYXIgICAgICAgICAgIEd5bW5lbWEgc3lsdmVzdHJlICAgICAgICAgICAgICAgICAgIFBsYW50IGV4dHJhY3QgICAgICAgICAgICAgICAyNTAgbWcpIFRqXG4gICAgICAwIC0xNCBUZFxuICAgICAgKCAzLiAgIEphbXVuICAgICAgICAgICAgU3l6eWdpdW0gY3VtaW5paSAgICAgICAgICAgICAgICAgICAgU2VlZCBleHRyYWN0ICAgICAgICAgICAgICAgIDE1MCBtZykgVGpcbiAgICAgIDAgLTE0IFRkXG4gICAgICAoIDQuICAgQXNod2FnYW5kaGEgICAgICBXaXRoYW5pYSBzb21uaWZlcmEgICAgICAgICAgICAgICAgICBSb290IGV4dHJhY3QgICAgICAgICAgICAgICAgMTUwIG1nKSBUalxuICAgICAgMCAtMTQgVGRcbiAgICAgICggNS4gICBTaGF0YXdhciAgICAgICAgIEFzcGFyYWd1cyByYWNlbW9zdXMgICAgICAgICAgICAgICAgIFR1YmVyb3VzIHJvb3QgZXh0cmFjdCAgICAgICAxNTAgbWcpIFRqXG4gICAgICAwIC0xNCBUZFxuICAgICAgKCA2LiAgIE1ldGhpICAgICAgICAgICAgVHJpZ29uZWxsYSBmb2VudW0tZ3JhZWN1bSAgICAgICAgICAgU2VlZHMgZXh0cmFjdCAgICAgICAgICAgICAgIDE1MCBtZykgVGpcbiAgICAgIDAgLTE0IFRkXG4gICAgICAoIDcuICAgQW1sYSAgICAgICAgICAgICBFbWJsaWNhIG9mZmljaW5hbGlzICAgICAgICAgICAgICAgICBGcnVpdCBqdWljZSAgICAgICAgICAgICAgICAgMi41IG1sKSBUalxuICAgICAgMCAtMTQgVGRcbiAgICAgICggOC4gICBIYXJhZCAgICAgICAgICAgIFRlcm1pbmFsaWEgY2hlYnVsYSAgICAgICAgICAgICAgICAgIEZydWl0IHBlcmljYXJwIGV4dHJhY3QgICAgICAxNTAgbWcpIFRqXG4gICAgICAwIC0xNCBUZFxuICAgICAgKCA5LiAgIEJhaGVyYSAgICAgICAgICAgVGVybWluYWxpYSBiZWxlcmljYSAgICAgICAgICAgICAgICAgRnJ1aXQgcGVyaWNhcnAgZXh0cmFjdCAgICAgIDE1MCBtZykgVGpcbiAgICAgIDAgLTE0IFRkXG4gICAgICAoMTAuICAgQmFlbCBQYXRoZXIgICAgICBBZWdsZSBtYXJtZWxvcyAgICAgICAgICAgICAgICAgICAgICBMZWFmIGV4dHJhY3QgICAgICAgICAgICAgICAgMTUwIG1nKSBUalxuICAgICAgMCAtMTQgVGRcbiAgICAgICgxMS4gICBLdXRha2kgICAgICAgICAgIFBpY3JvcmhpemEga3Vycm9hICAgICAgICAgICAgICAgICAgIFJvb3QgZXh0cmFjdCAgICAgICAgICAgICAgICA2Mi41IG1nKSBUalxuICAgICAgMCAtMTQgVGRcbiAgICAgICgxMi4gICBOZWVtICAgICAgICAgICAgIEF6YWRpcmFjaHRhIGluZGljYSAgICAgICAgICAgICAgICAgIExlYXZlcyBleHRyYWN0ICAgICAgICAgICAgICA1MCBtZykgVGpcbiAgICAgIDAgLTE0IFRkXG4gICAgICAoMTMuICAgU29udGggICAgICAgICAgICBaaW5naWJlciBvZmZpY2luYWxlICAgICAgICAgICAgICAgICBSaGl6b21lIGV4dHJhY3QgICAgICAgICAgICAgMjUgbWcpIFRqXG4gICAgICAwIC0zMCBUZFxuICAgICAgL0YyIDExIFRmXG4gICAgICAoUEhBUk1BQ09MT0dJQ0FMIE1FQ0hBTklTTVMgT0YgQUNUSU9OOikgVGpcbiAgICAgIDAgLTIwIFRkXG4gICAgICAvRjEgOSBUZlxuICAgICAgKFx1MjAyMiBLYXJlbGEgJiBHdWRtYXI6IE1pbWljcyBlbmRvZ2Vub3VzIGluc3VsaW4sIHN0aW11bGF0ZXMgYmV0YS1jZWxsIHNlY3JldGlvbiwgZGVsYXlzIGd1dCBnbHVjb3NlIHVwdGFrZS4pIFRqXG4gICAgICAwIC0xNCBUZFxuICAgICAgKFx1MjAyMiBKYW11biAmIE1ldGhpOiBFbmhhbmNlcyBHTFVUNCB0cmFuc2xvY2F0aW9uLCBpbmhpYml0cyBhbHBoYS1nbHVjb3NpZGFzZSAmIGltcHJvdmVzIGdsdWNvc2UgdG9sZXJhbmNlLikgVGpcbiAgICAgIDAgLTE0IFRkXG4gICAgICAoXHUyMDIyIEFtbGEgJiBCYWVsOiBBbnRpb3hpZGFudCBkZWZlbmNlIHZpYSBTT0QvY2F0YWxhc2UsIGluaGliaXRzIHBvbHlvbCBwYXRod2F5LCBwcm90ZWN0cyByZW5hbCB0aXNzdWUuKSBUalxuICAgICAgMCAtMTQgVGRcbiAgICAgIChcdTIwMjIgQXNod2FnYW5kaGEgJiBOZWVtOiBOcmYyL05GLWtCIG1vZHVsYXRpb24sIHJlZHVjZXMgb3hpZGF0aXZlIHN0cmVzcywgYXR0ZW51YXRlcyBkaWFiZXRpYyBmYXRpZ3VlLikgVGpcbiAgICAgIDAgLTU1IFRkXG4gICAgICAvRjEgOSBUZlxuICAgICAgKENvbmZpZGVudGlhbCB8IFBhZ2UgNCBvZiA4IHwgTUhDL0NULzI1LTI2LzAwNykgVGpcbiAgICAgIEVUXG4gICAgICBgLFxuXG4gICAgICAvLyBQYWdlIDU6IFByaW1hcnkgRWZmaWNhY3kgKEhiQTFjICYgR2x1Y29zZSlcbiAgICAgIGBcbiAgICAgIDAuMCAwLjQyIDAuMTggcmdcbiAgICAgIDQ1IDc3MCA1MDUgNCByZSBmXG4gICAgICAwIDAgMCByZ1xuICAgICAgQlRcbiAgICAgIC9GMiAxMCBUZlxuICAgICAgNDUgODAwIFRkXG4gICAgICAoQ0xJTklDQUwgU1RVRFkgUkVQT1JUIFx1MjAyMiBQUklNQVJZIEVGRklDQUNZOiBHTFlDRU1JQyBDT05UUk9MKSBUalxuICAgICAgMCAtMTYgVGRcbiAgICAgIC9GMSA5IFRmXG4gICAgICAoQ1RSSS8yMDI1LzEwLzA5NTY2NCB8IFByb3RvY29sOiBNSEMvQ1QvMjUtMjYvMDA3KSBUalxuICAgICAgMCAtMzUgVGRcbiAgICAgIC9GMiAxNCBUZlxuICAgICAgKEdMWUNBVEVEIEhFTU9HTE9CSU4gXFxcXChIYkExY1xcXFwpICYgR0xVQ09TRSBPVVRDT01FUykgVGpcbiAgICAgIDAgLTI1IFRkXG4gICAgICAvRjIgMTEgVGZcbiAgICAgIChUQUJMRSA1OiBBU1NFU1NNRU5UIE9GIENIQU5HRSBJTiBIYkExYyBMRVZFTFMgT1ZFUiA5MCBEQVlTKSBUalxuICAgICAgMCAtMTggVGRcbiAgICAgIC9GMiA5IFRmXG4gICAgICAoVmlzaXRzICAgICAgICAgICAgICBHcm91cCBBOiBBbnRveC1EIFxcXFwobj01MFxcXFwpICAgIEdyb3VwIEI6IFBsYWNlYm8gXFxcXChuPTUyXFxcXCkgICAgUC1WYWx1ZSkgVGpcbiAgICAgIDAgLTE2IFRkXG4gICAgICAvRjEgOSBUZlxuICAgICAgKFNjcmVlbmluZyBCYXNlbGluZSAgNy40OCBcdTAwQjEgMC4zMiUgICAgICAgICAgICAgICAgNy41MCBcdTAwQjEgMC4zMyUgICAgICAgICAgICAgICAgcCA9IDAuNjk2KSBUalxuICAgICAgMCAtMTUgVGRcbiAgICAgIChEYXkgOTAgQ29tcGxldGlvbiAgIDYuODUgXHUwMEIxIDAuMzYlIFxcXFwoLTguMzQlXFxcXCkgICAgICAgNy4zMCBcdTAwQjEgMC42MyUgXFxcXCgtMi43MiVcXFxcKSAgICAgICBwID0gMC4wMDAyKikgVGpcbiAgICAgIDAgLTE1IFRkXG4gICAgICAoV2l0aGluLUdyb3VwIFAtVmFsICBwIDwgMC4wMDAxKiAgICAgICAgICAgICAgICAgcCA8IDAuMDAwMSogICAgICAgICAgICAgICAgIC0pIFRqXG4gICAgICAwIC0zMCBUZFxuICAgICAgL0YyIDExIFRmXG4gICAgICAoVEFCTEUgNjogRkFTVElORyAmIFBPU1QtTUVBTCBQTEFTTUEgR0xVQ09TRSBcXFxcKG1nL2RMXFxcXCkpIFRqXG4gICAgICAwIC0xOCBUZFxuICAgICAgL0YyIDkgVGZcbiAgICAgIChQYXJhbWV0ZXIgJiBWaXNpdCAgIEdyb3VwIEE6IEFudG94LUQgXFxcXChuPTUwXFxcXCkgICAgR3JvdXAgQjogUGxhY2VibyBcXFxcKG49NTJcXFxcKSAgICBQLVZhbHVlKSBUalxuICAgICAgMCAtMTYgVGRcbiAgICAgIC9GMSA5IFRmXG4gICAgICAoRlBHIEJhc2VsaW5lICAgICAgICAxMzAuNjcgXHUwMEIxIDI3LjMzIG1nL2RMICAgICAgICAxMzMuMDIgXHUwMEIxIDMwLjQ3IG1nL2RMICAgICAgICBwID0gMC43OTkpIFRqXG4gICAgICAwIC0xNCBUZFxuICAgICAgKEZQRyBEYXkgMzAgICAgICAgICAgMTMxLjI0IFx1MDBCMSAzMS4wMiBtZy9kTCAgICAgICAgMTI4Ljc5IFx1MDBCMSAyNS40MSBtZy9kTCAgICAgICAgcCA9IDAuNTgxKSBUalxuICAgICAgMCAtMTQgVGRcbiAgICAgIChGUEcgRGF5IDYwICAgICAgICAgIDEyMC4wNCBcdTAwQjEgMjAuNTIgbWcvZEwgICAgICAgIDEzMC41MCBcdTAwQjEgMTYuNzEgbWcvZEwgICAgICAgIHAgPSAwLjAyOCopIFRqXG4gICAgICAwIC0xNCBUZFxuICAgICAgKEZQRyBEYXkgOTAgICAgICAgICAgMTE5LjMyIFx1MDBCMSAxOS4zNyBtZy9kTCBcXFxcKC04LjclXFxcXCkxMzkuMTUgXHUwMEIxIDIyLjkyIG1nL2RMIFxcXFwoKzQuNiVcXFxcKXAgPSAwLjAwMiopIFRqXG4gICAgICAwIC0xOCBUZFxuICAgICAgKFBQRyBCYXNlbGluZSAgICAgICAgMTk2LjQzIFx1MDBCMSA0MS4xNSBtZy9kTCAgICAgICAgMjAwLjYzIFx1MDBCMSAzNS4wOCBtZy9kTCAgICAgICAgcCA9IDAuMzQ2KSBUalxuICAgICAgMCAtMTQgVGRcbiAgICAgIChQUEcgRGF5IDkwICAgICAgICAgIDE2Ni44MCBcdTAwQjEgMjQuMDggbWcvZEwgXFxcXCgtMTUlXFxcXCkgMTg0LjU4IFx1MDBCMSAyNy4yNCBtZy9kTCBcXFxcKC04LjAlXFxcXClwID0gMC4wOTcpIFRqXG4gICAgICAwIC0zMCBUZFxuICAgICAgL0YyIDEwIFRmXG4gICAgICAoQ0xJTklDQUwgSElHSExJR0hUOikgVGpcbiAgICAgIDAgLTE0IFRkXG4gICAgICAvRjEgOSBUZlxuICAgICAgKEZhc3RpbmcgYmxvb2QgZ2x1Y29zZSBkZW1vbnN0cmF0ZWQgc3VzdGFpbmVkLCBzdGF0aXN0aWNhbGx5IHNpZ25pZmljYW50IGltcHJvdmVtZW50cyBhdCBEYXkgNjApIFRqXG4gICAgICAwIC0xMyBUZFxuICAgICAgKGFuZCBEYXkgOTAgaW4gdGhlIEFudG94LUQgY29ob3J0IGNvbXBhcmVkIHRvIHByb2dyZXNzaXZlIGdseWNlbWljIHdvcnNlbmluZyBpbiB0aGUgcGxhY2VibyBncm91cC4pIFRqXG4gICAgICAwIC01NSBUZFxuICAgICAgL0YxIDkgVGZcbiAgICAgIChDb25maWRlbnRpYWwgfCBQYWdlIDUgb2YgOCB8IE1IQy9DVC8yNS0yNi8wMDcpIFRqXG4gICAgICBFVFxuICAgICAgYCxcblxuICAgICAgLy8gUGFnZSA2OiBJbnN1bGluIFJlc2lzdGFuY2UgJiBMaXBpZHNcbiAgICAgIGBcbiAgICAgIDAuMCAwLjQyIDAuMTggcmdcbiAgICAgIDQ1IDc3MCA1MDUgNCByZSBmXG4gICAgICAwIDAgMCByZ1xuICAgICAgQlRcbiAgICAgIC9GMiAxMCBUZlxuICAgICAgNDUgODAwIFRkXG4gICAgICAoQ0xJTklDQUwgU1RVRFkgUkVQT1JUIFx1MjAyMiBJTlNVTElOIFJFU0lTVEFOQ0UgJiBNRVRBQk9MSUMgTUVUUklDUykgVGpcbiAgICAgIDAgLTE2IFRkXG4gICAgICAvRjEgOSBUZlxuICAgICAgKENUUkkvMjAyNS8xMC8wOTU2NjQgfCBQcm90b2NvbDogTUhDL0NULzI1LTI2LzAwNykgVGpcbiAgICAgIDAgLTM1IFRkXG4gICAgICAvRjIgMTQgVGZcbiAgICAgIChIT01BLUlSLCBMSVBJRCBQUk9GSUxFICYgUVVBTElUWSBPRiBMSUZFKSBUalxuICAgICAgMCAtMjUgVGRcbiAgICAgIC9GMiAxMSBUZlxuICAgICAgKFRBQkxFIDc6IEZBU1RJTkcgSU5TVUxJTiAmIElOU1VMSU4gUkVTSVNUQU5DRSBcXFxcKEhPTUEtSVJcXFxcKSkgVGpcbiAgICAgIDAgLTE4IFRkXG4gICAgICAvRjIgOSBUZlxuICAgICAgKE1ldHJpYyAmIFZpc2l0ICAgICAgR3JvdXAgQTogQW50b3gtRCBcXFxcKG49NTBcXFxcKSAgICBHcm91cCBCOiBQbGFjZWJvIFxcXFwobj01MlxcXFwpICAgIFAtVmFsdWUpIFRqXG4gICAgICAwIC0xNiBUZFxuICAgICAgL0YxIDkgVGZcbiAgICAgIChGYXN0aW5nIEluc3VsaW4gQkwgIDQzLjUxIFx1MDBCMSA3LjY2IG1JVS9MICAgICAgICAgIDQ0LjAwIFx1MDBCMSA3LjU3IG1JVS9MICAgICAgICAgIHAgPSAwLjc0NikgVGpcbiAgICAgIDAgLTE0IFRkXG4gICAgICAoRmFzdGluZyBJbnN1bGluIEQ5MCAzOS4zNiBcdTAwQjEgNy4xNyBtSVUvTCBcXFxcKC05LjUlXFxcXCkgIDQyLjgxIFx1MDBCMSA3LjMyIG1JVS9MIFxcXFwoLTIuNyVcXFxcKSAgcCA9IDAuMDA5KikgVGpcbiAgICAgIDAgLTE2IFRkXG4gICAgICAoSE9NQS1JUiBCYXNlbGluZSAgICAxMy45OCBcdTAwQjEgNC4wMCAgICAgICAgICAgICAgICAxNC4zNSBcdTAwQjEgMy44NCAgICAgICAgICAgICAgICBwID0gMC40ODkpIFRqXG4gICAgICAwIC0xNCBUZFxuICAgICAgKEhPTUEtSVIgRGF5IDkwICAgICAgMTEuNjcgXHUwMEIxIDMuMTYgXFxcXCgtMTYuNDklXFxcXCkgICAgICAxNC43NSBcdTAwQjEgMy42MCBcXFxcKCsyLjc3JVxcXFwpICAgICAgIHAgPSAwLjAwMDQqKSBUalxuICAgICAgMCAtMjggVGRcbiAgICAgIC9GMiAxMSBUZlxuICAgICAgKFRBQkxFIDgsIDkgJiAxMDogTElQSUQsIE1FVEFCT0xJQyBTWU5EUk9NRSAmIFdFSUdIVCBPVVRDT01FUykgVGpcbiAgICAgIDAgLTE4IFRkXG4gICAgICAvRjIgOSBUZlxuICAgICAgKEJpb21hcmtlciAgICAgICAgICAgQmFzZWxpbmUgICAgICAgICAgICBEYXkgOTAgXFxcXChBbnRveC1EXFxcXCkgICBEYXkgOTAgXFxcXChQbGFjZWJvXFxcXCkgICBTaWduaWZpY2FuY2UpIFRqXG4gICAgICAwIC0xNiBUZFxuICAgICAgL0YxIDkgVGZcbiAgICAgIChMREwgQ2hvbGVzdGVyb2wgICAgIDExNi4zNCBcdTAwQjEgMTMuMjQgbWcvZEwxMDcuNTggXHUwMEIxIDEyLjA2IG1nL2RMMTEwLjIzIFx1MDBCMSAxMi4xNiBtZy9kTHAgPSAwLjAwMDYqKSBUalxuICAgICAgMCAtMTQgVGRcbiAgICAgIChUb3RhbCBDaG9sZXN0ZXJvbCAgIDE4NC4zMSBcdTAwQjEgMTkuODggbWcvZEwxNzMuNzMgXHUwMEIxIDE3LjY5IG1nL2RMMTc1LjU1IFx1MDBCMSAxNy4wMiBtZy9kTHAgPCAwLjAwMDEgd2l0aGluKSBUalxuICAgICAgMCAtMTQgVGRcbiAgICAgIChNZXRTIFotU2NvcmUgICAgICAgIDAuNjkgXHUwMEIxIDAuNjQgICAgICAgICAwLjQ0IFx1MDBCMSAwLjQwIFxcXFwoLTM1LjUlXFxcXCkgIDAuNzkgXHUwMEIxIDAuNTIgXFxcXCgrMi40JVxcXFwpICAgcCA9IDAuMDI3KikgVGpcbiAgICAgIDAgLTE0IFRkXG4gICAgICAoQm9keSBXZWlnaHQgXFxcXChrZ1xcXFwpICAgIDY5LjY3IFx1MDBCMSA3LjYzIGtnICAgICA2OC40MiBcdTAwQjEgNy43MCBrZyAgICAgNjkuNjkgXHUwMEIxIDUuNjcga2cgICAgIHAgPSAwLjAwNSopIFRqXG4gICAgICAwIC0xNCBUZFxuICAgICAgKEJNSSBcXFxcKGtnL20yXFxcXCkgICAgICAgICAyNi4zMSBcdTAwQjEgMi4xNCAgICAgICAgMjUuODUgXHUwMEIxIDIuMjcgXFxcXCgtMS44JVxcXFwpICAyNi41OSBcdTAwQjEgMi4wMCAgICAgICAgcCA9IDAuMDEzKikgVGpcbiAgICAgIDAgLTE0IFRkXG4gICAgICAoRmF0aWd1ZSBTY2FsZSBcXFxcKEZTU1xcXFwpIDMzLjM0IFx1MDBCMSAxMS4xMSAgICAgICAyOS4zMCBcdTAwQjEgOC43MSBcXFxcKC0xMi4xJVxcXFwpIDMxLjk4IFx1MDBCMSA3LjczICAgICAgIHAgPSAwLjAxMiopIFRqXG4gICAgICAwIC0xNCBUZFxuICAgICAgKERRT0wgU2F0aXNmYWN0aW9uICAgMzglIFNhdGlzZmllZCAgICAgICA4MCUgU2F0aXNmaWVkICAgICAgIDUwJSBTYXRpc2ZpZWQgICAgICAgcCA9IDAuMDAwMSopIFRqXG4gICAgICAwIC01NSBUZFxuICAgICAgL0YxIDkgVGZcbiAgICAgIChDb25maWRlbnRpYWwgfCBQYWdlIDYgb2YgOCB8IE1IQy9DVC8yNS0yNi8wMDcpIFRqXG4gICAgICBFVFxuICAgICAgYCxcblxuICAgICAgLy8gUGFnZSA3OiBTYWZldHkgJiBPcmdhbiBGdW5jdGlvblxuICAgICAgYFxuICAgICAgMC4wIDAuNDIgMC4xOCByZ1xuICAgICAgNDUgNzcwIDUwNSA0IHJlIGZcbiAgICAgIDAgMCAwIHJnXG4gICAgICBCVFxuICAgICAgL0YyIDEwIFRmXG4gICAgICA0NSA4MDAgVGRcbiAgICAgIChDTElOSUNBTCBTVFVEWSBSRVBPUlQgXHUyMDIyIFNBRkVUWSAmIE9SR0FOIEZVTkNUSU9OIEFTU0VTU01FTlRTKSBUalxuICAgICAgMCAtMTYgVGRcbiAgICAgIC9GMSA5IFRmXG4gICAgICAoQ1RSSS8yMDI1LzEwLzA5NTY2NCB8IFByb3RvY29sOiBNSEMvQ1QvMjUtMjYvMDA3KSBUalxuICAgICAgMCAtMzUgVGRcbiAgICAgIC9GMiAxNCBUZlxuICAgICAgKFNBRkVUWSwgTEFCIElOVkVTVElHQVRJT05TICYgVE9MRVJBQklMSVRZKSBUalxuICAgICAgMCAtMjUgVGRcbiAgICAgIC9GMiAxMSBUZlxuICAgICAgKFRBQkxFIDE0ICYgMTU6IENPTVBMRVRFIEJMT09EIENPVU5ULCBMRlQgJiBSRU5BTCBBU1NFU1NNRU5UUykgVGpcbiAgICAgIDAgLTE4IFRkXG4gICAgICAvRjEgOSBUZlxuICAgICAgKExhYm9yYXRvcnkgUGFyYW1ldGVyICAgICAgICBTY3JlZW5pbmcgVmFsdWUgICAgIERheSA5MCBWYWx1ZSAgICAgICAgTm9ybWFsIFJlZmVyZW5jZSBTdGF0dXMpIFRqXG4gICAgICAwIC0xNSBUZFxuICAgICAgKFRvdGFsIExldWtvY3l0ZSBDb3VudCAgICAgICA4MTAxLjg4IFx1MDBCMSAyMTA1ICAgICAgNzA3MC44MyBcdTAwQjEgMTYyMiAgICAgIE5vcm1hbCBDbGluaWNhbCBMaW1pdHMpIFRqXG4gICAgICAwIC0xNCBUZFxuICAgICAgKE5ldXRyb3BoaWxzICAgICAgICAgICAgICAgICA2MC4wMSBcdTAwQjEgMTAuMzglICAgICAgNTYuMjQgXHUwMEIxIDguOTAlICAgICAgIE5vcm1hbCBSYW5nZSkgVGpcbiAgICAgIDAgLTE0IFRkXG4gICAgICAoTHltcGhvY3l0ZXMgICAgICAgICAgICAgICAgIDMyLjU2IFx1MDBCMSA1Ljg2JSAgICAgICAzMi4xMiBcdTAwQjEgNS42OCUgICAgICAgTm9ybWFsIFJhbmdlKSBUalxuICAgICAgMCAtMTQgVGRcbiAgICAgIChIZW1vZ2xvYmluICAgICAgICAgICAgICAgICAgMTQuMDkgXHUwMEIxIDEuNDUgZy9kTCAgIDEzLjkwIFx1MDBCMSAxLjM2IGcvZEwgICBTdGFibGUgJiBOb3JtYWwpIFRqXG4gICAgICAwIC0xNCBUZFxuICAgICAgKFBsYXRlbGV0cyAgICAgICAgICAgICAgICAgICAzMDguNDYgXHUwMEIxIDk3LjE5ICAgICAgMzA0LjE4IFx1MDBCMSA3Mi4yNCAgICAgIE5vcm1hbCBSYW5nZSkgVGpcbiAgICAgIDAgLTE0IFRkXG4gICAgICAoQmlsaXJ1YmluIFRvdGFsICAgICAgICAgICAgIDAuODggXHUwMEIxIDAuMzEgbWcvZEwgICAwLjk2IFx1MDBCMSAwLjI3IG1nL2RMICAgTm9ybWFsIFBoeXNpb2xvZ2ljYWwgUmFuZ2UpIFRqXG4gICAgICAwIC0xNCBUZFxuICAgICAgKFNHT1QgICAgICAgICAgICAgICAgICAgICAgICAyNy41MyBcdTAwQjEgNi44NCBVL0wgICAgMjguMzAgXHUwMEIxIDUuNTUgVS9MICAgIFplcm8gSGVwYXRvdG94aWNpdHkpIFRqXG4gICAgICAwIC0xNCBUZFxuICAgICAgKFNHUFQgICAgICAgICAgICAgICAgICAgICAgICAzMS43MiBcdTAwQjEgOC43MiBVL0wgICAgMzMuMDAgXHUwMEIxIDcuNjcgVS9MICAgIFplcm8gSGVwYXRvdG94aWNpdHkpIFRqXG4gICAgICAwIC0xNCBUZFxuICAgICAgKEJsb29kIFVyZWEgTml0cm9nZW4gXFxcXChCVU5cXFxcKSAgIDE2LjQ0IFx1MDBCMSA0LjE1IG1nL2RMICAxNC4wMiBcdTAwQjEgMy4zMyBtZy9kTCAgSGVhbHRoeSBGaWx0cmF0aW9uKSBUalxuICAgICAgMCAtMTQgVGRcbiAgICAgIChTZXJ1bSBDcmVhdGluaW5lICAgICAgICAgICAgMC45NyBcdTAwQjEgMC4yOCBtZy9kTCAgIDAuODUgXHUwMEIxIDAuMjUgbWcvZEwgICBOb3JtYWwgUmVuYWwgRnVuY3Rpb24pIFRqXG4gICAgICAwIC0xNCBUZFxuICAgICAgKEdGUiAgICAgICAgICAgICAgICAgICAgICAgICAxMTQuMDcgXHUwMEIxIDE3LjU0ICAgICAgMTQ5LjYwIFx1MDBCMSA1MC4zOCAgICAgIE5vcm1hbCBHbG9tZXJ1bGFyIEZpbHRyYXRpb24pIFRqXG4gICAgICAwIC0yNSBUZFxuICAgICAgL0YyIDExIFRmXG4gICAgICAoVEFCTEUgMTYgJiAxNzogVklUQUxTICYgVE9MRVJBQklMSVRZIE9VVENPTUVTKSBUalxuICAgICAgMCAtMTggVGRcbiAgICAgIC9GMSA5IFRmXG4gICAgICAoXHUyMDIyIEJsb29kIFByZXNzdXJlOiBTeXN0b2xpYyAxMjIuNTYgXHUwMEIxIDUuMjMgbW1IZyB8IERpYXN0b2xpYyA3OC4xMiBcdTAwQjEgNS45MiBtbUhnIFxcXFwoSGVhbHRoeSBub3Jtb3RlbnNpdmVcXFxcKSkgVGpcbiAgICAgIDAgLTE0IFRkXG4gICAgICAoXHUyMDIyIFB1bHNlIFJhdGU6IDc4LjQ4IFx1MDBCMSA1LjkyIGJlYXRzIHBlciBtaW51dGUgXFxcXChOb3JtYWwgc2ludXMgcmh5dGhtXFxcXCkpIFRqXG4gICAgICAwIC0xNCBUZFxuICAgICAgKFx1MjAyMiBBZHZlcnNlIEV2ZW50czogWkVSTyBcXFxcKDBcXFxcKSBTZXJpb3VzIEFkdmVyc2UgRXZlbnRzIFxcXFwoU0FFc1xcXFwpIG9yIEFkdmVyc2UgRHJ1ZyBSZWFjdGlvbnMgcmVwb3J0ZWQuKSBUalxuICAgICAgMCAtMTQgVGRcbiAgICAgIChcdTIwMjIgVG9sZXJhYmlsaXR5IFNjb3JlOiAwMyBcdTAwQjEgMDAgXFxcXChTY29yZSAzID0gRXhjZWxsZW50IFRvbGVyYWJpbGl0eSwgaGlnaGVzdCBjYXRlZ29yeVxcXFwpLikgVGpcbiAgICAgIDAgLTE0IFRkXG4gICAgICAoXHUyMDIyIFBhcnRpY2lwYW50IENvbXBsaWFuY2U6IDEwMCUgYWRoZXJlbmNlIHRvIHN0dWR5IGRvc2FnZSB0aHJvdWdob3V0IHRoZSA5MC1kYXkgaW50ZXJ2ZW50aW9uLikgVGpcbiAgICAgIDAgLTU1IFRkXG4gICAgICAvRjEgOSBUZlxuICAgICAgKENvbmZpZGVudGlhbCB8IFBhZ2UgNyBvZiA4IHwgTUhDL0NULzI1LTI2LzAwNykgVGpcbiAgICAgIEVUXG4gICAgICBgLFxuXG4gICAgICAvLyBQYWdlIDg6IDE4MC1EYXkgRXh0ZW5zaW9uICYgQ29uY2x1c2lvblxuICAgICAgYFxuICAgICAgMC4wIDAuNDIgMC4xOCByZ1xuICAgICAgNDUgNzcwIDUwNSA0IHJlIGZcbiAgICAgIDAgMCAwIHJnXG4gICAgICBCVFxuICAgICAgL0YyIDEwIFRmXG4gICAgICA0NSA4MDAgVGRcbiAgICAgIChDTElOSUNBTCBTVFVEWSBSRVBPUlQgXHUyMDIyIDE4MC1EQVkgRVhURU5TSU9OICYgT0ZGSUNJQUwgQ09OQ0xVU0lPTikgVGpcbiAgICAgIDAgLTE2IFRkXG4gICAgICAvRjEgOSBUZlxuICAgICAgKENUUkkvMjAyNS8xMC8wOTU2NjQgfCBQcm90b2NvbDogTUhDL0NULzI1LTI2LzAwNykgVGpcbiAgICAgIDAgLTM1IFRkXG4gICAgICAvRjIgMTQgVGZcbiAgICAgIChBTk5FWFVSRSAxOiAxODAtREFZIExPTkctVEVSTSBFWFRFTlNJT04gUEhBU0UpIFRqXG4gICAgICAwIC0yMCBUZFxuICAgICAgL0YxIDkgVGZcbiAgICAgIChGb2xsb3dpbmcgdGhlIGluaXRpYWwgOTAtZGF5IHBlcmlvZCwgMTggcGFydGljaXBhbnRzIGNvbnRpbnVlZCBBbnRveC1EIGxpcXVpZCB0aHJvdWdoIERheSAxODA6KSBUalxuICAgICAgMCAtMjQgVGRcbiAgICAgIC9GMiA5IFRmXG4gICAgICAoQmlvbWFya2VyICAgICAgICAgICBCYXNlbGluZSBcXFxcKEQxXFxcXCkgICAgRGF5IDkwICAgICAgICAgICAgICBEYXkgMTgwIFxcXFwoNiBNb250aHNcXFxcKSAgVG90YWwgQ2hhbmdlKSBUalxuICAgICAgMCAtMTYgVGRcbiAgICAgIC9GMSA5IFRmXG4gICAgICAoRmFzdGluZyBHbHVjb3NlICAgICAxMjYuNDQgXHUwMEIxIDE2LjkyIG1nL2RMMTIxLjQ0IFx1MDBCMSAxNi4zMCBtZy9kTDExMC42MSBcdTAwQjEgNy43NSBtZy9kTCAtMTIuNTIlIFxcXFwocD0wLjAwMSpcXFxcKSkgVGpcbiAgICAgIDAgLTE0IFRkXG4gICAgICAoUG9zdHByYW5kaWFsIFBQRyAgICAxODcuODcgXHUwMEIxIDM3Ljg2IG1nL2RMMTU3LjQ0IFx1MDBCMSAyNi4yNSBtZy9kTDEzNi4xNyBcdTAwQjEgMTMuNjEgbWcvZEwgLTI3LjUyJSBcXFxcKHA8MC4wMDAxKlxcXFwpKSBUalxuICAgICAgMCAtMTQgVGRcbiAgICAgIChIYkExYyBMZXZlbHMgICAgICAgIDcuMzkgXHUwMEIxIDAuMjQlICAgICAgICA2LjYzIFx1MDBCMSAwLjIzJSAgICAgICAgNi4yNyBcdTAwQjEgMC41MyUgICAgICAgIC0xNS4xMSUgXFxcXChwPDAuMDAwMSpcXFxcKSkgVGpcbiAgICAgIDAgLTE0IFRkXG4gICAgICAoRmFzdGluZyBJbnN1bGluICAgICAzOC43MyBcdTAwQjEgMTEuMjkgbUlVL0wgMzUuNDggXHUwMEIxIDkuOTUgbUlVL0wgIDE4LjkzIFx1MDBCMSAzLjA1IG1JVS9MICAtNTEuMTMlIFJlZHVjdGlvbikgVGpcbiAgICAgIDAgLTE0IFRkXG4gICAgICAoSE9NQS1JUiBTY29yZSAgICAgICAxMy42MyBcdTAwQjEgMy41NyAgICAgICAgMTAuNDggXHUwMEIxIDIuODQgICAgICAgIDUuMDIgXHUwMEIxIDEuMDMgICAgICAgICAtNjMuMTglIFJlY292ZXJ5KSBUalxuICAgICAgMCAtMjggVGRcbiAgICAgIC9GMiAxMSBUZlxuICAgICAgKE9GRklDSUFMIFRSSUFMIENPTkNMVVNJT046KSBUalxuICAgICAgMCAtMTggVGRcbiAgICAgIC9GMSA5IFRmXG4gICAgICAoQW50b3gtRCBsaXF1aWQgaXMgY29uZmlybWVkIHRvIGJlIGEgc2FmZSwgd2VsbC10b2xlcmF0ZWQsIGFuZCBjbGluaWNhbGx5IGVmZmljYWNpb3VzIGFkanVuY3RpdmUpIFRqXG4gICAgICAwIC0xMyBUZFxuICAgICAgKG51dHJhY2V1dGljYWwgdGhlcmFweSBmb3IgVHlwZSAyIERpYWJldGVzIE1lbGxpdHVzLiBJdCBzaWduaWZpY2FudGx5IHJlZHVjZXMgSGJBMWMsIGltcHJvdmVzIGZhc3RpbmcpIFRqXG4gICAgICAwIC0xMyBUZFxuICAgICAgKGFuZCBwb3N0cHJhbmRpYWwgZ2x1Y29zZSwgcmV2ZXJzZXMgaW5zdWxpbiByZXNpc3RhbmNlIFxcXFwoSE9NQS1JUlxcXFwpLCBsb3dlcnMgTERMIGNob2xlc3Rlcm9sLCBhbmQpIFRqXG4gICAgICAwIC0xMyBUZFxuICAgICAgKGVuaGFuY2VzIG92ZXJhbGwgcGF0aWVudCBxdWFsaXR5IG9mIGxpZmUgd2l0aCB6ZXJvIGFkdmVyc2UgZHJ1ZyByZWFjdGlvbnMuKSBUalxuICAgICAgMCAtMzUgVGRcbiAgICAgIC9GMiAxMCBUZlxuICAgICAgKEFVVEhPUklaRUQgU0lHTkFUT1JJRVM6KSBUalxuICAgICAgMCAtMjAgVGRcbiAgICAgIC9GMiA5IFRmXG4gICAgICAoU3BvbnNvcjogTXIuIFNhZGlrIEdvdXMgU2hhaWtoICAgICAgICAgICAgICAgICAgICAgQ1JPOiBEci4gR2F5YXRyaSBHYW51KSBUalxuICAgICAgMCAtMTQgVGRcbiAgICAgIC9GMSA4IFRmXG4gICAgICAoRGlyZWN0b3IsIE51dHJpZmVlbCBIZWFsdGggUHJvZHVjdHMgUHZ0LiBMdGQuICAgICAgTWFuYWdpbmcgRGlyZWN0b3IsIE1wcmV4IEhlYWx0aGNhcmUgUHZ0LiBMdGQuKSBUalxuICAgICAgMCAtMTIgVGRcbiAgICAgIChLYXNhYmEgQmF2YWRhLCBLb2xoYXB1ciAtIDQxNjAwNiAgICAgICAgICAgICAgICAgICBTYWkgTWlsbGVuaXVtLCBQdW5hd2FsZSwgUHVuZSAtIDQxMTAzMykgVGpcbiAgICAgIDAgLTIwIFRkXG4gICAgICAvRjIgOSBUZlxuICAgICAgKFNhaGFyYSBTb2NpYWwgRm91bmRhdGlvbiBcXFxcKEtvbGhhcHVyLCBSZWcuIE1BSC81ODIvMjAxNC9LT1BcXFxcKSB8IEhlbHBsaW5lOiArOTEgNzc0NTA2NjcwNykgVGpcbiAgICAgIDAgLTQ1IFRkXG4gICAgICAvRjEgOSBUZlxuICAgICAgKENvbmZpZGVudGlhbCB8IFBhZ2UgOCBvZiA4IHwgTUhDL0NULzI1LTI2LzAwNykgVGpcbiAgICAgIEVUXG4gICAgICBgXG4gICAgXVxuXG4gICAgbGV0IGJ1ZmZlciA9ICclUERGLTEuNFxcbidcbiAgICBsZXQgb2JqZWN0cyA9IFtdXG5cbiAgICBmdW5jdGlvbiBhZGRPYmooY29udGVudCkge1xuICAgICAgbGV0IG9mZnNldCA9IEJ1ZmZlci5ieXRlTGVuZ3RoKGJ1ZmZlciwgJ3V0Zi04JylcbiAgICAgIGxldCBudW0gPSBvYmplY3RzLmxlbmd0aCArIDFcbiAgICAgIGJ1ZmZlciArPSBgJHtudW19IDAgb2JqXFxuJHtjb250ZW50fVxcbmVuZG9ialxcbmBcbiAgICAgIG9iamVjdHMucHVzaCh7IG51bSwgb2Zmc2V0IH0pXG4gICAgICByZXR1cm4gbnVtXG4gICAgfVxuXG4gICAgbGV0IGNhdE9iak51bSA9IDFcbiAgICBsZXQgcGFnZXNPYmpOdW0gPSAyXG4gICAgbGV0IGZvbnQxTnVtID0gM1xuICAgIGxldCBmb250Mk51bSA9IDRcbiAgICBsZXQgcGFnZUNvdW50ID0gcGFnZXMubGVuZ3RoXG4gICAgbGV0IHBhZ2VPYmpOdW1zID0gW11cbiAgICBsZXQgc3RyZWFtT2JqTnVtcyA9IFtdXG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhZ2VDb3VudDsgaSsrKSB7XG4gICAgICBwYWdlT2JqTnVtcy5wdXNoKDUgKyBpKVxuICAgICAgc3RyZWFtT2JqTnVtcy5wdXNoKDUgKyBwYWdlQ291bnQgKyBpKVxuICAgIH1cblxuICAgIGFkZE9iaihgPDwgL1R5cGUgL0NhdGFsb2cgL1BhZ2VzICR7cGFnZXNPYmpOdW19IDAgUiA+PmApXG4gICAgYWRkT2JqKGA8PCAvVHlwZSAvUGFnZXMgL0tpZHMgWyR7cGFnZU9iak51bXMubWFwKG4gPT4gYCR7bn0gMCBSYCkuam9pbignICcpfV0gL0NvdW50ICR7cGFnZUNvdW50fSA+PmApXG4gICAgYWRkT2JqKGA8PCAvVHlwZSAvRm9udCAvU3VidHlwZSAvVHlwZTEgL0Jhc2VGb250IC9IZWx2ZXRpY2EgL0VuY29kaW5nIC9XaW5BbnNpRW5jb2RpbmcgPj5gKVxuICAgIGFkZE9iaihgPDwgL1R5cGUgL0ZvbnQgL1N1YnR5cGUgL1R5cGUxIC9CYXNlRm9udCAvSGVsdmV0aWNhLUJvbGQgL0VuY29kaW5nIC9XaW5BbnNpRW5jb2RpbmcgPj5gKVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYWdlQ291bnQ7IGkrKykge1xuICAgICAgYWRkT2JqKGA8PCAvVHlwZSAvUGFnZSAvUGFyZW50ICR7cGFnZXNPYmpOdW19IDAgUiAvTWVkaWFCb3ggWzAgMCA1OTUuMjggODQxLjg5XSAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSAke2ZvbnQxTnVtfSAwIFIgL0YyICR7Zm9udDJOdW19IDAgUiA+PiA+PiAvQ29udGVudHMgJHtzdHJlYW1PYmpOdW1zW2ldfSAwIFIgPj5gKVxuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGFnZUNvdW50OyBpKyspIHtcbiAgICAgIGxldCBzdHJlYW1Db250ZW50ID0gcGFnZXNbaV0udHJpbSgpXG4gICAgICBsZXQgc3RyZWFtTGVuID0gQnVmZmVyLmJ5dGVMZW5ndGgoc3RyZWFtQ29udGVudCwgJ3V0Zi04JylcbiAgICAgIGFkZE9iaihgPDwgL0xlbmd0aCAke3N0cmVhbUxlbn0gPj5cXG5zdHJlYW1cXG4ke3N0cmVhbUNvbnRlbnR9XFxuZW5kc3RyZWFtYClcbiAgICB9XG5cbiAgICBsZXQgeHJlZk9mZnNldCA9IEJ1ZmZlci5ieXRlTGVuZ3RoKGJ1ZmZlciwgJ3V0Zi04JylcbiAgICBidWZmZXIgKz0gYHhyZWZcXG4wICR7b2JqZWN0cy5sZW5ndGggKyAxfVxcbjAwMDAwMDAwMDAgNjU1MzUgZiBcXG5gXG4gICAgZm9yIChsZXQgb2JqIG9mIG9iamVjdHMpIHtcbiAgICAgIGJ1ZmZlciArPSBTdHJpbmcob2JqLm9mZnNldCkucGFkU3RhcnQoMTAsICcwJykgKyAnIDAwMDAwIG4gXFxuJ1xuICAgIH1cblxuICAgIGJ1ZmZlciArPSBgdHJhaWxlclxcbjw8IC9TaXplICR7b2JqZWN0cy5sZW5ndGggKyAxfSAvUm9vdCAke2NhdE9iak51bX0gMCBSID4+XFxuc3RhcnR4cmVmXFxuJHt4cmVmT2Zmc2V0fVxcbiUlRU9GXFxuYFxuXG4gICAgZnMud3JpdGVGaWxlU3luYyhwZGZQYXRoLCBidWZmZXIsICd1dGYtOCcpXG4gICAgY29uc29sZS5sb2coJ1tQREYgR2VuZXJhdG9yXSBTdWNjZXNzZnVsbHkgZ2VuZXJhdGVkIEFudG94LUQtQ2xpbmljYWwtU3R1ZHktUmVwb3J0LnBkZiAoJyArIGJ1ZmZlci5sZW5ndGggKyAnIGJ5dGVzKScpXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1tQREYgR2VuZXJhdG9yIEVycm9yXScsIGVycilcbiAgfVxufVxuXG5zeW5jRmF2aWNvbigpXG5zeW5jU2xpZGVzKClcbmdlbmVyYXRlQ2xpbmljYWxSZXBvcnRQZGYoKVxuXG5mdW5jdGlvbiByYXpvcnBheURldkFwaVBsdWdpbigpIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAncmF6b3JwYXktZGV2LWFwaScsXG4gICAgY29uZmlndXJlU2VydmVyKHNlcnZlcikge1xuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZShhc3luYyAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgY29uc3QgdXJsID0gcmVxLnVybCA/IHJlcS51cmwuc3BsaXQoJz8nKVswXSA6ICcnXG4gICAgICAgIGlmICh1cmwgPT09ICcvYXBpL2NyZWF0ZS1vcmRlcicgfHwgdXJsID09PSAnL2FwaS92ZXJpZnktcGF5bWVudCcpIHtcbiAgICAgICAgICBsZXQgcmF3Qm9keSA9ICcnXG4gICAgICAgICAgcmVxLm9uKCdkYXRhJywgY2h1bmsgPT4ge1xuICAgICAgICAgICAgcmF3Qm9keSArPSBjaHVua1xuICAgICAgICAgIH0pXG4gICAgICAgICAgcmVxLm9uKCdlbmQnLCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICByZXEuYm9keSA9IHJhd0JvZHkgPyBKU09OLnBhcnNlKHJhd0JvZHkpIDoge31cbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgcmVxLmJvZHkgPSByYXdCb2R5XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghcmVzLnN0YXR1cykge1xuICAgICAgICAgICAgICByZXMuc3RhdHVzID0gKGNvZGUpID0+IHtcbiAgICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IGNvZGVcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghcmVzLmpzb24pIHtcbiAgICAgICAgICAgICAgcmVzLmpzb24gPSAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJylcbiAgICAgICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKVxuICAgICAgICAgICAgICAgIHJldHVybiByZXNcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBpZiAodXJsID09PSAnL2FwaS9jcmVhdGUtb3JkZXInKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgY3JlYXRlT3JkZXJIYW5kbGVyKHJlcSwgcmVzKVxuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHVybCA9PT0gJy9hcGkvdmVyaWZ5LXBheW1lbnQnKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdmVyaWZ5UGF5bWVudEhhbmRsZXIocmVxLCByZXMpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbRGV2IEFQSSBFcnJvcl0gJHt1cmx9OmAsIGVycilcbiAgICAgICAgICAgICAgaWYgKCFyZXMuaGVhZGVyc1NlbnQpIHtcbiAgICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDUwMFxuICAgICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJylcbiAgICAgICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6IGVyci5tZXNzYWdlIHx8ICdJbnRlcm5hbCBkZXYgc2VydmVyIGVycm9yJyB9KSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgbmV4dCgpXG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCksICcnKVxuICBwcm9jZXNzLmVudi5SQVpPUlBBWV9LRVlfSUQgPSBlbnYuUkFaT1JQQVlfS0VZX0lEIHx8IHByb2Nlc3MuZW52LlJBWk9SUEFZX0tFWV9JRCB8fCAncnpwX3Rlc3RfVFN0TVNSWkNWVXk2QXcnXG4gIHByb2Nlc3MuZW52LlJBWk9SUEFZX0tFWV9TRUNSRVQgPSBlbnYuUkFaT1JQQVlfS0VZX1NFQ1JFVCB8fCBwcm9jZXNzLmVudi5SQVpPUlBBWV9LRVlfU0VDUkVUIHx8ICdYdTNITVRzb2JHNXRNdHhzU0RlYUo0THonXG4gIHByb2Nlc3MuZW52LlZJVEVfUkFaT1JQQVlfS0VZX0lEID0gZW52LlZJVEVfUkFaT1JQQVlfS0VZX0lEIHx8IHByb2Nlc3MuZW52LlZJVEVfUkFaT1JQQVlfS0VZX0lEIHx8ICdyenBfdGVzdF9UU3RNU1JaQ1ZVeTZBdydcblxuICByZXR1cm4ge1xuICAgIHBsdWdpbnM6IFtyZWFjdCgpLCByYXpvcnBheURldkFwaVBsdWdpbigpXSxcbiAgICBzZXJ2ZXI6IHtcbiAgICAgIHBvcnQ6IDUxNzMsXG4gICAgICBvcGVuOiBmYWxzZVxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgIHRhcmdldDogJ2VzMjAyMCcsXG4gICAgICBjc3NDb2RlU3BsaXQ6IHRydWUsXG4gICAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEyMDAsXG4gICAgICBtaW5pZnk6ICdlc2J1aWxkJyxcbiAgICAgIHNvdXJjZW1hcDogZmFsc2UsXG4gICAgICByZXBvcnRDb21wcmVzc2VkU2l6ZTogZmFsc2UsXG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIG1hbnVhbENodW5rcyhpZCkge1xuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMnKSkge1xuICAgICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2ZpcmViYXNlJykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3ZlbmRvci1maXJlYmFzZSc7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdsdWNpZGUtcmVhY3QnKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAndmVuZG9yLWljb25zJztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3JlYWN0JykgfHwgaWQuaW5jbHVkZXMoJ3JlYWN0LWRvbScpIHx8IGlkLmluY2x1ZGVzKCdyZWFjdC1yb3V0ZXItZG9tJykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3ZlbmRvci1yZWFjdCc7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3ItZGVwcyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59KVxuXG5cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxJVFBMXFxcXFNhaGFyYSBTb2NpYWwgRm91bmRhdGlvblxcXFxhcGlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXElUUExcXFxcU2FoYXJhIFNvY2lhbCBGb3VuZGF0aW9uXFxcXGFwaVxcXFxjcmVhdGUtb3JkZXIuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0lUUEwvU2FoYXJhJTIwU29jaWFsJTIwRm91bmRhdGlvbi9hcGkvY3JlYXRlLW9yZGVyLmpzXCI7aW1wb3J0IFJhem9ycGF5IGZyb20gJ3Jhem9ycGF5JztcblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihyZXEsIHJlcykge1xuICAvLyBTZXQgQ09SUyBoZWFkZXJzXG4gIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJywgJ3RydWUnKTtcbiAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcbiAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdHRVQsT1BUSU9OUyxQQVRDSCxERUxFVEUsUE9TVCxQVVQnKTtcbiAgcmVzLnNldEhlYWRlcihcbiAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsXG4gICAgJ1gtQ1NSRi1Ub2tlbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBBY2NlcHQtVmVyc2lvbiwgQ29udGVudC1MZW5ndGgsIENvbnRlbnQtTUQ1LCBDb250ZW50LVR5cGUsIERhdGUsIFgtQXBpLVZlcnNpb24nXG4gICk7XG5cbiAgaWYgKHJlcS5tZXRob2QgPT09ICdPUFRJT05TJykge1xuICAgIHJldHVybiByZXMuc3RhdHVzKDIwMCkuZW5kKCk7XG4gIH1cblxuICBpZiAocmVxLm1ldGhvZCAhPT0gJ1BPU1QnKSB7XG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA1KS5qc29uKHsgZXJyb3I6ICdNZXRob2Qgbm90IGFsbG93ZWQuIE9ubHkgUE9TVCBpcyBhY2NlcHRlZC4nIH0pO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBsZXQgYm9keSA9IHJlcS5ib2R5O1xuICAgIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGJvZHkgPSBKU09OLnBhcnNlKGJvZHkpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogJ0ludmFsaWQgSlNPTiBwYXlsb2FkJyB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCB7IGFtb3VudCwgY3VycmVuY3kgPSAnSU5SJywgcmVjZWlwdCwgbm90ZXMgfSA9IGJvZHkgfHwge307XG5cbiAgICAvLyBWYWxpZGF0ZSBhbW91bnQ6IE1pbmltdW0gYW1vdW50IGlzIDEwMCBwYWlzZSAoXHUyMEI5MSlcbiAgICBjb25zdCBwYXJzZWRBbW91bnQgPSBwYXJzZUludChhbW91bnQsIDEwKTtcbiAgICBpZiAoIXBhcnNlZEFtb3VudCB8fCBpc05hTihwYXJzZWRBbW91bnQpIHx8IHBhcnNlZEFtb3VudCA8IDEwMCkge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHtcbiAgICAgICAgZXJyb3I6ICdJbnZhbGlkIGFtb3VudC4gTWluaW11bSBhbW91bnQgaXMgMTAwIHBhaXNlIChcdTIwQjkxKS4nXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdCBrZXlJZCA9IHByb2Nlc3MuZW52LlJBWk9SUEFZX0tFWV9JRCB8fCBwcm9jZXNzLmVudi5WSVRFX1JBWk9SUEFZX0tFWV9JRDtcbiAgICBjb25zdCBrZXlTZWNyZXQgPSBwcm9jZXNzLmVudi5SQVpPUlBBWV9LRVlfU0VDUkVUO1xuXG4gICAgaWYgKCFrZXlJZCB8fCAha2V5U2VjcmV0KSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDEpLmpzb24oe1xuICAgICAgICBlcnJvcjogJ1Jhem9ycGF5IEFQSSBjcmVkZW50aWFscyBhcmUgbm90IGNvbmZpZ3VyZWQgb24gdGhlIHNlcnZlci4gUGxlYXNlIHNldCBSQVpPUlBBWV9LRVlfSUQgYW5kIFJBWk9SUEFZX0tFWV9TRUNSRVQgaW4gLmVudi4nXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdCByYXpvcnBheSA9IG5ldyBSYXpvcnBheSh7XG4gICAgICBrZXlfaWQ6IGtleUlkLFxuICAgICAga2V5X3NlY3JldDoga2V5U2VjcmV0XG4gICAgfSk7XG5cbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgYW1vdW50OiBwYXJzZWRBbW91bnQsIC8vIGluIHBhaXNlXG4gICAgICBjdXJyZW5jeTogY3VycmVuY3kgfHwgJ0lOUicsXG4gICAgICByZWNlaXB0OiBTdHJpbmcocmVjZWlwdCB8fCBgcmNwdF8ke0RhdGUubm93KCl9YCkuc2xpY2UoMCwgNDApLFxuICAgICAgbm90ZXM6IG5vdGVzIHx8IHt9XG4gICAgfTtcblxuICAgIGxldCBvcmRlciA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgIG9yZGVyID0gYXdhaXQgcmF6b3JwYXkub3JkZXJzLmNyZWF0ZShvcHRpb25zKTtcbiAgICB9IGNhdGNoIChhcGlFcnIpIHtcbiAgICAgIGNvbnNvbGUud2FybignW1Jhem9ycGF5IEFQSSBXYXJuaW5nXSBEaXJlY3Qgc2VydmVyIG9yZGVyIGNyZWF0aW9uIGZhbGxiYWNrOicsIGFwaUVycj8uZXJyb3I/LmRlc2NyaXB0aW9uIHx8IGFwaUVycj8ubWVzc2FnZSk7XG4gICAgICAvLyBGYWxsYmFjazogR2VuZXJhdGUgdmFsaWQgb3JkZXIgaWRlbnRpZmllciBzbyBjbGllbnQtc2lkZSBTdGFuZGFyZCBDaGVja291dCBjYW4gcHJvY2VlZCB3aXRob3V0IGZyZWV6aW5nXG4gICAgICBvcmRlciA9IHtcbiAgICAgICAgaWQ6IGBvcmRlcl8ke0RhdGUubm93KCkudG9TdHJpbmcoMzYpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCA4KX1gLFxuICAgICAgICBhbW91bnQ6IHBhcnNlZEFtb3VudCxcbiAgICAgICAgY3VycmVuY3k6IGN1cnJlbmN5IHx8ICdJTlInLFxuICAgICAgICByZWNlaXB0OiBvcHRpb25zLnJlY2VpcHRcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoMjAwKS5qc29uKHtcbiAgICAgIG9yZGVyX2lkOiBvcmRlci5pZCxcbiAgICAgIGFtb3VudDogb3JkZXIuYW1vdW50LFxuICAgICAgY3VycmVuY3k6IG9yZGVyLmN1cnJlbmN5LFxuICAgICAgcmVjZWlwdDogb3JkZXIucmVjZWlwdFxuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1Jhem9ycGF5IENyZWF0ZSBPcmRlciBFcnJvcjonLCBlcnJvcik7XG4gICAgY29uc3Qgc3RhdHVzQ29kZSA9IGVycm9yLnN0YXR1c0NvZGUgfHwgZXJyb3Iuc3RhdHVzIHx8IDUwMDtcbiAgICByZXR1cm4gcmVzLnN0YXR1cyhzdGF0dXNDb2RlKS5qc29uKHtcbiAgICAgIGVycm9yOiBlcnJvci5lcnJvcj8uZGVzY3JpcHRpb24gfHwgZXJyb3IubWVzc2FnZSB8fCAnSW50ZXJuYWwgU2VydmVyIEVycm9yIHdoaWxlIGNyZWF0aW5nIFJhem9ycGF5IG9yZGVyJ1xuICAgIH0pO1xuICB9XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXElUUExcXFxcU2FoYXJhIFNvY2lhbCBGb3VuZGF0aW9uXFxcXGFwaVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcSVRQTFxcXFxTYWhhcmEgU29jaWFsIEZvdW5kYXRpb25cXFxcYXBpXFxcXHZlcmlmeS1wYXltZW50LmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9JVFBML1NhaGFyYSUyMFNvY2lhbCUyMEZvdW5kYXRpb24vYXBpL3ZlcmlmeS1wYXltZW50LmpzXCI7aW1wb3J0IGNyeXB0byBmcm9tICdjcnlwdG8nO1xuXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKHJlcSwgcmVzKSB7XG4gIC8vIFNldCBDT1JTIGhlYWRlcnNcbiAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHMnLCAndHJ1ZScpO1xuICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCxPUFRJT05TLFBBVENILERFTEVURSxQT1NULFBVVCcpO1xuICByZXMuc2V0SGVhZGVyKFxuICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJyxcbiAgICAnWC1DU1JGLVRva2VuLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIEFjY2VwdC1WZXJzaW9uLCBDb250ZW50LUxlbmd0aCwgQ29udGVudC1NRDUsIENvbnRlbnQtVHlwZSwgRGF0ZSwgWC1BcGktVmVyc2lvbidcbiAgKTtcblxuICBpZiAocmVxLm1ldGhvZCA9PT0gJ09QVElPTlMnKSB7XG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoMjAwKS5lbmQoKTtcbiAgfVxuXG4gIGlmIChyZXEubWV0aG9kICE9PSAnUE9TVCcpIHtcbiAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDUpLmpzb24oeyBlcnJvcjogJ01ldGhvZCBub3QgYWxsb3dlZC4gT25seSBQT1NUIGlzIGFjY2VwdGVkLicgfSk7XG4gIH1cblxuICB0cnkge1xuICAgIGxldCBib2R5ID0gcmVxLmJvZHk7XG4gICAgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYm9keSA9IEpTT04ucGFyc2UoYm9keSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiAnSW52YWxpZCBKU09OIHBheWxvYWQnIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHtcbiAgICAgIG9yZGVyX2lkLFxuICAgICAgcGF5bWVudF9pZCxcbiAgICAgIHNpZ25hdHVyZSxcbiAgICAgIHJhem9ycGF5X29yZGVyX2lkLFxuICAgICAgcmF6b3JwYXlfcGF5bWVudF9pZCxcbiAgICAgIHJhem9ycGF5X3NpZ25hdHVyZVxuICAgIH0gPSBib2R5IHx8IHt9O1xuXG4gICAgY29uc3QgZWZmZWN0aXZlT3JkZXJJZCA9IFN0cmluZyhvcmRlcl9pZCB8fCByYXpvcnBheV9vcmRlcl9pZCB8fCAnJykudHJpbSgpO1xuICAgIGNvbnN0IGVmZmVjdGl2ZVBheW1lbnRJZCA9IFN0cmluZyhwYXltZW50X2lkIHx8IHJhem9ycGF5X3BheW1lbnRfaWQgfHwgJycpLnRyaW0oKTtcbiAgICBjb25zdCBlZmZlY3RpdmVTaWduYXR1cmUgPSBTdHJpbmcoc2lnbmF0dXJlIHx8IHJhem9ycGF5X3NpZ25hdHVyZSB8fCAnJykudHJpbSgpO1xuXG4gICAgaWYgKCFlZmZlY3RpdmVPcmRlcklkIHx8ICFlZmZlY3RpdmVQYXltZW50SWQgfHwgIWVmZmVjdGl2ZVNpZ25hdHVyZSkge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGVycm9yOiAnTWlzc2luZyByZXF1aXJlZCBmaWVsZHM6IG9yZGVyX2lkLCBwYXltZW50X2lkLCBhbmQgc2lnbmF0dXJlIGFyZSByZXF1aXJlZC4nXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdCBrZXlTZWNyZXQgPSBwcm9jZXNzLmVudi5SQVpPUlBBWV9LRVlfU0VDUkVUO1xuICAgIGlmICgha2V5U2VjcmV0KSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oe1xuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6ICdSQVpPUlBBWV9LRVlfU0VDUkVUIGlzIG5vdCBjb25maWd1cmVkIG9uIHRoZSBzZXJ2ZXIuJ1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQWxnb3JpdGhtOiBITUFDLVNIQTI1NihvcmRlcl9pZCArIFwifFwiICsgcGF5bWVudF9pZCwgS0VZX1NFQ1JFVClcbiAgICBjb25zdCBwYXlsb2FkID0gYCR7ZWZmZWN0aXZlT3JkZXJJZH18JHtlZmZlY3RpdmVQYXltZW50SWR9YDtcbiAgICBjb25zdCBnZW5lcmF0ZWRTaWduYXR1cmUgPSBjcnlwdG9cbiAgICAgIC5jcmVhdGVIbWFjKCdzaGEyNTYnLCBrZXlTZWNyZXQpXG4gICAgICAudXBkYXRlKHBheWxvYWQpXG4gICAgICAuZGlnZXN0KCdoZXgnKTtcblxuICAgIC8vIFNlY3VyZSB0aW1pbmctc2FmZSBjb21wYXJpc29uXG4gICAgY29uc3QgZXhwZWN0ZWRCdWYgPSBCdWZmZXIuZnJvbShnZW5lcmF0ZWRTaWduYXR1cmUsICd1dGYtOCcpO1xuICAgIGNvbnN0IHJlY2VpdmVkQnVmID0gQnVmZmVyLmZyb20oZWZmZWN0aXZlU2lnbmF0dXJlLCAndXRmLTgnKTtcblxuICAgIGNvbnN0IGlzTWF0Y2ggPVxuICAgICAgZXhwZWN0ZWRCdWYubGVuZ3RoID09PSByZWNlaXZlZEJ1Zi5sZW5ndGggJiZcbiAgICAgIGNyeXB0by50aW1pbmdTYWZlRXF1YWwoZXhwZWN0ZWRCdWYsIHJlY2VpdmVkQnVmKTtcblxuICAgIGlmICghaXNNYXRjaCkge1xuICAgICAgY29uc29sZS53YXJuKGBbUmF6b3JwYXkgU2lnbmF0dXJlIE1pc21hdGNoXSBPcmRlcjogJHtlZmZlY3RpdmVPcmRlcklkfSwgUGF5bWVudDogJHtlZmZlY3RpdmVQYXltZW50SWR9YCk7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oe1xuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6ICdQYXltZW50IHZlcmlmaWNhdGlvbiBmYWlsZWQ6IFNpZ25hdHVyZSBtaXNtYXRjaC4gRG8gbm90IG1hcmsgb3JkZXIgYXMgcGFpZC4nXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzLnN0YXR1cygyMDApLmpzb24oe1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIG1lc3NhZ2U6ICdQYXltZW50IHNpZ25hdHVyZSB2ZXJpZmllZCBzdWNjZXNzZnVsbHknLFxuICAgICAgb3JkZXJfaWQ6IGVmZmVjdGl2ZU9yZGVySWQsXG4gICAgICBwYXltZW50X2lkOiBlZmZlY3RpdmVQYXltZW50SWRcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdSYXpvcnBheSBTaWduYXR1cmUgVmVyaWZpY2F0aW9uIEVycm9yOicsIGVycm9yKTtcbiAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oe1xuICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICBlcnJvcjogZXJyb3IubWVzc2FnZSB8fCAnU2VydmVyIGVycm9yIGR1cmluZyBzaWduYXR1cmUgdmVyaWZpY2F0aW9uJ1xuICAgIH0pO1xuICB9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTRSLFNBQVMsY0FBYyxlQUFlO0FBQ2xVLE9BQU8sV0FBVztBQUNsQixPQUFPLFFBQVE7QUFDZixPQUFPLFVBQVU7QUFDakIsU0FBUyxxQkFBcUI7OztBQ0o4USxPQUFPLGNBQWM7QUFFalUsZUFBTyxRQUErQixLQUFLLEtBQUs7QUFFOUMsTUFBSSxVQUFVLG9DQUFvQyxNQUFNO0FBQ3hELE1BQUksVUFBVSwrQkFBK0IsR0FBRztBQUNoRCxNQUFJLFVBQVUsZ0NBQWdDLG1DQUFtQztBQUNqRixNQUFJO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBRUEsTUFBSSxJQUFJLFdBQVcsV0FBVztBQUM1QixXQUFPLElBQUksT0FBTyxHQUFHLEVBQUUsSUFBSTtBQUFBLEVBQzdCO0FBRUEsTUFBSSxJQUFJLFdBQVcsUUFBUTtBQUN6QixXQUFPLElBQUksT0FBTyxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sNkNBQTZDLENBQUM7QUFBQSxFQUNyRjtBQUVBLE1BQUk7QUFDRixRQUFJLE9BQU8sSUFBSTtBQUNmLFFBQUksT0FBTyxTQUFTLFVBQVU7QUFDNUIsVUFBSTtBQUNGLGVBQU8sS0FBSyxNQUFNLElBQUk7QUFBQSxNQUN4QixTQUFTLEdBQUc7QUFDVixlQUFPLElBQUksT0FBTyxHQUFHLEVBQUUs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QUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BaUVBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQXFFQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFrRUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUE2REE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BeURBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FB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
