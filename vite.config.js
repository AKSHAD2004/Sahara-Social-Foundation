import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function syncFavicon() {
  try {
    const publicDir = path.resolve(__dirname, 'public')
    const logoJpg = path.join(publicDir, 'sahara-logo.jpg')
    if (fs.existsSync(logoJpg)) {
      const buffer = fs.readFileSync(logoJpg)
      const b64 = buffer.toString('base64')
      
      const svgContent = `<svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <clipPath id="circleClip">
      <circle cx="250" cy="250" r="248" />
    </clipPath>
  </defs>
  <circle cx="250" cy="250" r="250" fill="#ffffff" />
  <image href="data:image/jpeg;base64,${b64}" xlink:href="data:image/jpeg;base64,${b64}" x="0" y="0" width="500" height="500" clip-path="url(#circleClip)" />
</svg>`
      fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf8')
    }
  } catch (e) {
    console.error('[Favicon Sync Error]', e)
  }
}

function syncSlides() {
  try {
    const src1 = 'C:\\Users\\hp\\.gemini\\antigravity\\brain\\1063b621-a072-4128-b62a-e63ec48eade1\\.user_uploaded\\media_1790845004738.jpg'
    const src2 = 'C:\\Users\\hp\\.gemini\\antigravity\\brain\\1063b621-a072-4128-b62a-e63ec48eade1\\.user_uploaded\\media_1790845049239.jpg'
    const publicDir = path.resolve(__dirname, 'public')
    if (fs.existsSync(src1)) {
      fs.copyFileSync(src1, path.join(publicDir, 'slide-antox-d.jpg'))
      fs.copyFileSync(src1, path.join(publicDir, 'hero-slide-1.jpg'))
      console.log('[Slide Sync] Copied slide-1')
    }
    if (fs.existsSync(src2)) {
      fs.copyFileSync(src2, path.join(publicDir, 'slide-antox-amrut.jpg'))
      fs.copyFileSync(src2, path.join(publicDir, 'hero-slide-2.jpg'))
      console.log('[Slide Sync] Copied slide-2')
    }
  } catch (e) {
    console.error('[Slide Sync Error]', e)
  }
}

function syncClinicalPdf() {
  try {
    const publicDir = path.resolve(__dirname, 'public')
    const reportsDir = path.join(publicDir, 'reports')
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true })
    }
    const targetPdf = path.join(reportsDir, 'Antox-D-Clinical-Study-Report.pdf')
    const userPdf = 'C:\\Users\\hp\\.gemini\\antigravity\\brain\\15e38a52-3c71-40ac-97d0-992c8cf16187\\.user_uploaded\\media_1790937161122.pdf'
    if (fs.existsSync(userPdf)) {
      fs.copyFileSync(userPdf, targetPdf)
      console.log('[PDF Sync] Copied user uploaded PDF to public/reports/Antox-D-Clinical-Study-Report.pdf')
      return true
    }
  } catch (err) {
    console.error('[PDF Sync Error]', err)
  }
  return false
}

function generateClinicalReportPdf() {
  try {
    if (syncClinicalPdf()) {
      return
    }
    const publicDir = path.resolve(__dirname, 'public')
    const reportsDir = path.join(publicDir, 'reports')
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true })
    }
    const pdfPath = path.join(reportsDir, 'Antox-D-Clinical-Study-Report.pdf')

    const pages = [
      // Page 1: Cover & Protocol
      `
      0.0 0.42 0.18 rg
      45 770 505 4 re f
      0 0 0 rg
      BT
      /F2 10 Tf
      45 800 Td
      (CONFIDENTIAL • CLINICAL STUDY REPORT) Tj
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
      (• Primary Efficacy: HbA1c reduced by 8.34% in Antox-D group vs 2.72% in placebo \\(p = 0.0002\\)) Tj
      0 -16 Td
      (• Fasting Plasma Glucose: Decreased by 8.68% reaching 119.32 mg/dL at Day 90 \\(p = 0.002\\)) Tj
      0 -16 Td
      (• Postprandial Glucose: Reduced by 15.09% \\(196.43 mg/dL to 166.80 mg/dL\\)) Tj
      0 -16 Td
      (• Insulin Resistance: HOMA-IR reduced by 16.49% in Antox-D vs +2.77% in placebo \\(p = 0.0004\\)) Tj
      0 -16 Td
      (• Lipid Profile: LDL cholesterol lowered by 7.53% \\(p = 0.0006\\), MetS Z-score improved by 35.47%) Tj
      0 -16 Td
      (• Safety Profile: ZERO adverse drug reactions \\(ADRs\\), 100% compliance, 03/03 tolerability score) Tj
      0 -16 Td
      (• 180-Day Extension: Sustained HbA1c control down to 6.27% and 63.18% reversal of HOMA-IR) Tj
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
      (CLINICAL STUDY REPORT • ETHICS & INVESTIGATOR DECLARATION) Tj
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
      (• Good Clinical Practice \\(ICH-GCP\\) and Declaration of Helsinki \\(DoH\\) adhered strictly.) Tj
      0 -16 Td
      (• Prospective Registration on CTRI \\(Clinical Trials Registry - India\\): CTRI/2025/10/095664.) Tj
      0 -16 Td
      (• Informed Consent Form \\(ICF\\) executed for all 104 enrolled participants prior to initiation.) Tj
      0 -16 Td
      (• Full confidentiality and coded participant identification maintained per regulatory norms.) Tj
      0 -16 Td
      (• Drug manufacture performed under Good Manufacturing Practices \\(GMP\\) certified facilities.) Tj
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
      (CLINICAL STUDY REPORT • STUDY SYNOPSIS & METHODOLOGY) Tj
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
      (• Group A \\(Test Arm\\): Antox-D liquid \\(10 ml twice daily, 1 hr before meals with water\\) + OHA) Tj
      0 -14 Td
      (• Group B \\(Placebo Arm\\): Placebo liquid \\(10 ml twice daily, 1 hr before meals with water\\) + OHA) Tj
      0 -22 Td
      /F2 10 Tf
      (Sample Size & Completion Rate:) Tj
      0 -14 Td
      /F1 10 Tf
      (• 104 randomized participants \\(Group A: 52, Group B: 52\\)) Tj
      0 -14 Td
      (• 102 completed the full 90-day protocol \\(Group A: 50, Group B: 52; 2 discontinued lost to follow-up\\)) Tj
      0 -22 Td
      /F2 10 Tf
      (Eligibility & Selection Criteria:) Tj
      0 -14 Td
      /F1 10 Tf
      (• Inclusion: Male & female aged 30-65 years, T2DM receiving stable OHAs \\(biguanides + sulfonylureas\\),) Tj
      0 -14 Td
      (  baseline HbA1c between 7.0% and 9.0%, Body Mass Index \\(BMI\\) < 30 kg/m2.) Tj
      0 -14 Td
      (• Exclusion: Type 1 diabetes, insulin therapy, severe renal/hepatic dysfunction, pregnancy/lactation.) Tj
      0 -22 Td
      /F2 10 Tf
      (Visit Schedule & Durations:) Tj
      0 -14 Td
      /F1 10 Tf
      (• Screening Visit \\(Day -7 to Day 0\\) | Baseline Visit 1 \\(Day 1\\) | Visit 2 \\(Day 30 ± 5\\)) Tj
      0 -14 Td
      (• Visit 3 \\(Day 60 ± 5\\) | Visit 4 \\(Day 90 ± 5 - End of Primary Trial\\) | Extension \\(Day 91 to Day 180\\)) Tj
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
      (CLINICAL STUDY REPORT • TABLE 3: ACTIVE BOTANICAL INGREDIENTS) Tj
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
      (• Karela & Gudmar: Mimics endogenous insulin, stimulates beta-cell secretion, delays gut glucose uptake.) Tj
      0 -14 Td
      (• Jamun & Methi: Enhances GLUT4 translocation, inhibits alpha-glucosidase & improves glucose tolerance.) Tj
      0 -14 Td
      (• Amla & Bael: Antioxidant defence via SOD/catalase, inhibits polyol pathway, protects renal tissue.) Tj
      0 -14 Td
      (• Ashwagandha & Neem: Nrf2/NF-kB modulation, reduces oxidative stress, attenuates diabetic fatigue.) Tj
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
      (CLINICAL STUDY REPORT • PRIMARY EFFICACY: GLYCEMIC CONTROL) Tj
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
      (Screening Baseline  7.48 ± 0.32%                7.50 ± 0.33%                p = 0.696) Tj
      0 -15 Td
      (Day 90 Completion   6.85 ± 0.36% \\(-8.34%\\)       7.30 ± 0.63% \\(-2.72%\\)       p = 0.0002*) Tj
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
      (FPG Baseline        130.67 ± 27.33 mg/dL        133.02 ± 30.47 mg/dL        p = 0.799) Tj
      0 -14 Td
      (FPG Day 30          131.24 ± 31.02 mg/dL        128.79 ± 25.41 mg/dL        p = 0.581) Tj
      0 -14 Td
      (FPG Day 60          120.04 ± 20.52 mg/dL        130.50 ± 16.71 mg/dL        p = 0.028*) Tj
      0 -14 Td
      (FPG Day 90          119.32 ± 19.37 mg/dL \\(-8.7%\\)139.15 ± 22.92 mg/dL \\(+4.6%\\)p = 0.002*) Tj
      0 -18 Td
      (PPG Baseline        196.43 ± 41.15 mg/dL        200.63 ± 35.08 mg/dL        p = 0.346) Tj
      0 -14 Td
      (PPG Day 90          166.80 ± 24.08 mg/dL \\(-15%\\) 184.58 ± 27.24 mg/dL \\(-8.0%\\)p = 0.097) Tj
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
      (CLINICAL STUDY REPORT • INSULIN RESISTANCE & METABOLIC METRICS) Tj
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
      (Fasting Insulin BL  43.51 ± 7.66 mIU/L          44.00 ± 7.57 mIU/L          p = 0.746) Tj
      0 -14 Td
      (Fasting Insulin D90 39.36 ± 7.17 mIU/L \\(-9.5%\\)  42.81 ± 7.32 mIU/L \\(-2.7%\\)  p = 0.009*) Tj
      0 -16 Td
      (HOMA-IR Baseline    13.98 ± 4.00                14.35 ± 3.84                p = 0.489) Tj
      0 -14 Td
      (HOMA-IR Day 90      11.67 ± 3.16 \\(-16.49%\\)      14.75 ± 3.60 \\(+2.77%\\)       p = 0.0004*) Tj
      0 -28 Td
      /F2 11 Tf
      (TABLE 8, 9 & 10: LIPID, METABOLIC SYNDROME & WEIGHT OUTCOMES) Tj
      0 -18 Td
      /F2 9 Tf
      (Biomarker           Baseline            Day 90 \\(Antox-D\\)   Day 90 \\(Placebo\\)   Significance) Tj
      0 -16 Td
      /F1 9 Tf
      (LDL Cholesterol     116.34 ± 13.24 mg/dL107.58 ± 12.06 mg/dL110.23 ± 12.16 mg/dLp = 0.0006*) Tj
      0 -14 Td
      (Total Cholesterol   184.31 ± 19.88 mg/dL173.73 ± 17.69 mg/dL175.55 ± 17.02 mg/dLp < 0.0001 within) Tj
      0 -14 Td
      (MetS Z-Score        0.69 ± 0.64         0.44 ± 0.40 \\(-35.5%\\)  0.79 ± 0.52 \\(+2.4%\\)   p = 0.027*) Tj
      0 -14 Td
      (Body Weight \\(kg\\)    69.67 ± 7.63 kg     68.42 ± 7.70 kg     69.69 ± 5.67 kg     p = 0.005*) Tj
      0 -14 Td
      (BMI \\(kg/m2\\)         26.31 ± 2.14        25.85 ± 2.27 \\(-1.8%\\)  26.59 ± 2.00        p = 0.013*) Tj
      0 -14 Td
      (Fatigue Scale \\(FSS\\) 33.34 ± 11.11       29.30 ± 8.71 \\(-12.1%\\) 31.98 ± 7.73       p = 0.012*) Tj
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
      (CLINICAL STUDY REPORT • SAFETY & ORGAN FUNCTION ASSESSMENTS) Tj
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
      (Total Leukocyte Count       8101.88 ± 2105      7070.83 ± 1622      Normal Clinical Limits) Tj
      0 -14 Td
      (Neutrophils                 60.01 ± 10.38%      56.24 ± 8.90%       Normal Range) Tj
      0 -14 Td
      (Lymphocytes                 32.56 ± 5.86%       32.12 ± 5.68%       Normal Range) Tj
      0 -14 Td
      (Hemoglobin                  14.09 ± 1.45 g/dL   13.90 ± 1.36 g/dL   Stable & Normal) Tj
      0 -14 Td
      (Platelets                   308.46 ± 97.19      304.18 ± 72.24      Normal Range) Tj
      0 -14 Td
      (Bilirubin Total             0.88 ± 0.31 mg/dL   0.96 ± 0.27 mg/dL   Normal Physiological Range) Tj
      0 -14 Td
      (SGOT                        27.53 ± 6.84 U/L    28.30 ± 5.55 U/L    Zero Hepatotoxicity) Tj
      0 -14 Td
      (SGPT                        31.72 ± 8.72 U/L    33.00 ± 7.67 U/L    Zero Hepatotoxicity) Tj
      0 -14 Td
      (Blood Urea Nitrogen \\(BUN\\)   16.44 ± 4.15 mg/dL  14.02 ± 3.33 mg/dL  Healthy Filtration) Tj
      0 -14 Td
      (Serum Creatinine            0.97 ± 0.28 mg/dL   0.85 ± 0.25 mg/dL   Normal Renal Function) Tj
      0 -14 Td
      (GFR                         114.07 ± 17.54      149.60 ± 50.38      Normal Glomerular Filtration) Tj
      0 -25 Td
      /F2 11 Tf
      (TABLE 16 & 17: VITALS & TOLERABILITY OUTCOMES) Tj
      0 -18 Td
      /F1 9 Tf
      (• Blood Pressure: Systolic 122.56 ± 5.23 mmHg | Diastolic 78.12 ± 5.92 mmHg \\(Healthy normotensive\\)) Tj
      0 -14 Td
      (• Pulse Rate: 78.48 ± 5.92 beats per minute \\(Normal sinus rhythm\\)) Tj
      0 -14 Td
      (• Adverse Events: ZERO \\(0\\) Serious Adverse Events \\(SAEs\\) or Adverse Drug Reactions reported.) Tj
      0 -14 Td
      (• Tolerability Score: 03 ± 00 \\(Score 3 = Excellent Tolerability, highest category\\).) Tj
      0 -14 Td
      (• Participant Compliance: 100% adherence to study dosage throughout the 90-day intervention.) Tj
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
      (CLINICAL STUDY REPORT • 180-DAY EXTENSION & OFFICIAL CONCLUSION) Tj
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
      (Fasting Glucose     126.44 ± 16.92 mg/dL121.44 ± 16.30 mg/dL110.61 ± 7.75 mg/dL -12.52% \\(p=0.001*\\)) Tj
      0 -14 Td
      (Postprandial PPG    187.87 ± 37.86 mg/dL157.44 ± 26.25 mg/dL136.17 ± 13.61 mg/dL -27.52% \\(p<0.0001*\\)) Tj
      0 -14 Td
      (HbA1c Levels        7.39 ± 0.24%        6.63 ± 0.23%        6.27 ± 0.53%        -15.11% \\(p<0.0001*\\)) Tj
      0 -14 Td
      (Fasting Insulin     38.73 ± 11.29 mIU/L 35.48 ± 9.95 mIU/L  18.93 ± 3.05 mIU/L  -51.13% Reduction) Tj
      0 -14 Td
      (HOMA-IR Score       13.63 ± 3.57        10.48 ± 2.84        5.02 ± 1.03         -63.18% Recovery) Tj
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
    ]

    let buffer = '%PDF-1.4\n'
    let objects = []

    function addObj(content) {
      let offset = Buffer.byteLength(buffer, 'utf-8')
      let num = objects.length + 1
      buffer += `${num} 0 obj\n${content}\nendobj\n`
      objects.push({ num, offset })
      return num
    }

    let catObjNum = 1
    let pagesObjNum = 2
    let font1Num = 3
    let font2Num = 4
    let pageCount = pages.length
    let pageObjNums = []
    let streamObjNums = []

    for (let i = 0; i < pageCount; i++) {
      pageObjNums.push(5 + i)
      streamObjNums.push(5 + pageCount + i)
    }

    addObj(`<< /Type /Catalog /Pages ${pagesObjNum} 0 R >>`)
    addObj(`<< /Type /Pages /Kids [${pageObjNums.map(n => `${n} 0 R`).join(' ')}] /Count ${pageCount} >>`)
    addObj(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`)
    addObj(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`)

    for (let i = 0; i < pageCount; i++) {
      addObj(`<< /Type /Page /Parent ${pagesObjNum} 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 ${font1Num} 0 R /F2 ${font2Num} 0 R >> >> /Contents ${streamObjNums[i]} 0 R >>`)
    }

    for (let i = 0; i < pageCount; i++) {
      let streamContent = pages[i].trim()
      let streamLen = Buffer.byteLength(streamContent, 'utf-8')
      addObj(`<< /Length ${streamLen} >>\nstream\n${streamContent}\nendstream`)
    }

    let xrefOffset = Buffer.byteLength(buffer, 'utf-8')
    buffer += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
    for (let obj of objects) {
      buffer += String(obj.offset).padStart(10, '0') + ' 00000 n \n'
    }

    buffer += `trailer\n<< /Size ${objects.length + 1} /Root ${catObjNum} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`

    fs.writeFileSync(pdfPath, buffer, 'utf-8')
    console.log('[PDF Generator] Successfully generated Antox-D-Clinical-Study-Report.pdf (' + buffer.length + ' bytes)')
  } catch (err) {
    console.error('[PDF Generator Error]', err)
  }
}

syncFavicon()
syncSlides()
generateClinicalReportPdf()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false
  }
})



