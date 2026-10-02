import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  ExternalLink, 
  Download, 
  FileText, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  ChevronRight,
  TrendingDown,
  Activity,
  Heart,
  Users,
  Calendar,
  Building2,
  Stethoscope
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { organizationInfo } from '../data/websiteData';

const ClinicalStudyReportModal = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('synopsis');

  if (!isOpen) return null;

  return (
    <div 
      className="csr-modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 25, 12, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        className="csr-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          width: '100%',
          maxWidth: '1050px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
          border: '1px solid #C8DEC5',
          overflow: 'hidden'
        }}
      >
        {/* Modal Top Header Bar */}
        <div style={{
          backgroundColor: '#04200e',
          background: 'linear-gradient(90deg, #04200e 0%, #006B2D 50%, #04200e 100%)',
          color: '#ffffff',
          padding: '1rem 1.4rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          borderBottom: '2px solid #FFC928'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              backgroundColor: '#FFC928',
              color: '#17251B',
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <FileText size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '0.01em', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span>Antox - D Total Clinical Study Report (CSR)</span>
                <span style={{ fontSize: '0.72rem', backgroundColor: 'rgba(255, 201, 40, 0.25)', color: '#FFC928', padding: '2px 8px', borderRadius: '999px', border: '1px solid rgba(255, 201, 40, 0.5)' }}>
                  CTRI/2025/10/095664
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#c7edd1' }}>
                Protocol: MHC/CT/25-26/007 (Version 2.00) • 78 Pages Complete Research Dossier
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <a
              href="/reports/Antox-D-Clinical-Study-Report.html"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.35)',
                fontSize: '0.80rem',
                padding: '0.4rem 0.85rem'
              }}
              title="Open full page in new tab"
            >
              <ExternalLink size={14} />
              <span className="hide-mobile-text">Full Tab</span>
            </a>

            <button
              onClick={() => window.open('/reports/Antox-D-Clinical-Study-Report.html', '_blank')}
              className="btn btn-accent btn-sm"
              style={{ fontSize: '0.80rem', padding: '0.4rem 0.85rem' }}
              title="Print or Save official PDF"
            >
              <Printer size={14} />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                border: 'none',
                color: '#ffffff',
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div style={{
          backgroundColor: '#F3F8F1',
          borderBottom: '1px solid #D5E5D3',
          padding: '0.4rem 1rem',
          display: 'flex',
          gap: '0.35rem',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}>
          {[
            { id: 'synopsis', labelEn: '1. Study Synopsis', labelMr: '१. अभ्यास सारांश' },
            { id: 'ingredients', labelEn: '2. 13 Active Herbs', labelMr: '२. १३ घटक वनस्पती' },
            { id: 'efficacy', labelEn: '3. Clinical Efficacy (HbA1c & Glucose)', labelMr: '३. साखर व HbA1c परिणाम' },
            { id: 'insulin', labelEn: '4. Insulin Resistance (HOMA-IR)', labelMr: '४. इन्सुलिन प्रतिकार' },
            { id: 'safety', labelEn: '5. Safety & Organ Function', labelMr: '५. सुरक्षितता व चाचण्या' },
            { id: 'extension', labelEn: '6. 180-Day Extension Results', labelMr: '६. १८० दिवस निष्कर्ष' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                backgroundColor: activeTab === tab.id ? '#006B2D' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : '#17251B',
                boxShadow: activeTab === tab.id ? '0 2px 6px rgba(0, 107, 45, 0.25)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {language === 'mr' ? tab.labelMr : tab.labelEn}
            </button>
          ))}
        </div>

        {/* Scrollable Modal Content */}
        <div style={{
          padding: '1.5rem',
          overflowY: 'auto',
          flex: 1,
          fontSize: '0.92rem',
          lineHeight: 1.6
        }}>

          {/* TAB 1: SYNOPSIS & TRIAL DETAILS */}
          {activeTab === 'synopsis' && (
            <div>
              <div style={{
                background: 'linear-gradient(135deg, #f0f8ee 0%, #ffffff 100%)',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid #D5E5D3',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <ShieldCheck size={20} style={{ color: '#006B2D' }} />
                  <span style={{ fontWeight: 800, color: '#006B2D', fontSize: '1rem' }}>
                    Clinical Study Report Overview (Protocol MHC/CT/25-26/007)
                  </span>
                </div>
                <p style={{ color: '#324035', fontSize: '0.92rem', marginBottom: '1rem' }}>
                  A randomized, double-blind, parallel-arm, interventional prospective Phase II clinical trial evaluating the efficacy and safety of Antox-D liquid health supplement in patients with Type 2 Diabetes Mellitus.
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                  gap: '0.75rem'
                }}>
                  <div style={{ backgroundColor: '#ffffff', padding: '0.85rem', borderRadius: '8px', border: '1px solid #E1E9DF' }}>
                    <div style={{ fontSize: '0.75rem', color: '#5F6B61', fontWeight: 700 }}>GOVT. REGISTRATION</div>
                    <div style={{ fontWeight: 800, color: '#006B2D', fontSize: '0.92rem' }}>CTRI/2025/10/095664</div>
                    <div style={{ fontSize: '0.74rem', color: '#88988a' }}>Registered on: 06/10/2025</div>
                  </div>

                  <div style={{ backgroundColor: '#ffffff', padding: '0.85rem', borderRadius: '8px', border: '1px solid #E1E9DF' }}>
                    <div style={{ fontSize: '0.75rem', color: '#5F6B61', fontWeight: 700 }}>STUDY POPULATION</div>
                    <div style={{ fontWeight: 800, color: '#006B2D', fontSize: '0.92rem' }}>102 Completed (104 Randomized)</div>
                    <div style={{ fontSize: '0.74rem', color: '#88988a' }}>Group A: 50 | Group B (Placebo): 52</div>
                  </div>

                  <div style={{ backgroundColor: '#ffffff', padding: '0.85rem', borderRadius: '8px', border: '1px solid #E1E9DF' }}>
                    <div style={{ fontSize: '0.75rem', color: '#5F6B61', fontWeight: 700 }}>INTERVENTION DOSAGE</div>
                    <div style={{ fontWeight: 800, color: '#006B2D', fontSize: '0.92rem' }}>10 ml Twice Daily</div>
                    <div style={{ fontSize: '0.74rem', color: '#88988a' }}>1 hr before lunch & dinner with water</div>
                  </div>

                  <div style={{ backgroundColor: '#ffffff', padding: '0.85rem', borderRadius: '8px', border: '1px solid #E1E9DF' }}>
                    <div style={{ fontSize: '0.75rem', color: '#5F6B61', fontWeight: 700 }}>TOTAL STUDY DURATION</div>
                    <div style={{ fontWeight: 800, color: '#006B2D', fontSize: '0.92rem' }}>90 Days Primary + 90 Days Ext.</div>
                    <div style={{ fontSize: '0.74rem', color: '#88988a' }}>Up to 180 Days continuous monitoring</div>
                  </div>
                </div>
              </div>

              {/* Research Teams & Hospitals */}
              <h3 style={{ fontSize: '1.05rem', color: '#006B2D', marginBottom: '0.85rem', fontWeight: 800 }}>
                Study Management, Ethics & Clinical Sites
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ backgroundColor: '#F9FBF8', padding: '1rem', borderRadius: '10px', border: '1px solid #E1E9DF' }}>
                  <div style={{ fontWeight: 800, color: '#006B2D', fontSize: '0.90rem', marginBottom: '0.35rem' }}>
                    🏥 Site 1: Omkar Multispeciality Hospital
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#17251B' }}>
                    <strong>Principal Investigator:</strong> Dr. Anuja Mukesh Phatak<br />
                    Survey No. 94, Plot No. 81, Ravet, Pune, MH - 412101.<br />
                    Institutional Ethics Committee Approval: Granted.
                  </div>
                </div>

                <div style={{ backgroundColor: '#F9FBF8', padding: '1rem', borderRadius: '10px', border: '1px solid #E1E9DF' }}>
                  <div style={{ fontWeight: 800, color: '#006B2D', fontSize: '0.90rem', marginBottom: '0.35rem' }}>
                    🏥 Site 2: Care Multispeciality Hospital
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#17251B' }}>
                    <strong>Principal Investigator:</strong> Dr. Dhyaneshwar Manwatkar<br />
                    Kolte Arcade, Nagar Rd, Wagholi, Pune, MH - 412207.<br />
                    Institutional Ethics Committee Approval: Granted.
                  </div>
                </div>

                <div style={{ backgroundColor: '#F9FBF8', padding: '1rem', borderRadius: '10px', border: '1px solid #E1E9DF' }}>
                  <div style={{ fontWeight: 800, color: '#006B2D', fontSize: '0.90rem', marginBottom: '0.35rem' }}>
                    🔬 Contract Research Organization (CRO)
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#17251B' }}>
                    <strong>Mprex Healthcare Pvt. Ltd.</strong><br />
                    Managing Director: Dr. Gayatri Ganu<br />
                    Office 813-816, Sai Millenium, Punawale, Pune - 411033.<br />
                    Responsible for medical writing, GCP monitoring & biostatistics.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INGREDIENTS TABLE */}
          {activeTab === 'ingredients' && (
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.05rem', color: '#006B2D', fontWeight: 800, marginBottom: '0.25rem' }}>
                  Table 3: Standardized Active Ingredients of Antox-D Liquid (per 10 ml)
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#5F6B61' }}>
                  Formulated exclusively with botanical extracts possessing documented insulin-mimetic, glycemic-regulatory, and organ-protective properties.
                </p>
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid #E1E9DF', borderRadius: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#006B2D', color: '#ffffff' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Sr.</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Common Name</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Botanical Scientific Name</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Part / Extract Type</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Dose per 10 ml</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { s: 1, c: 'Karela', b: 'Momordica charantia', p: 'Fruit extract', q: '250 mg' },
                      { s: 2, c: 'Gudmar', b: 'Gymnema sylvestre', p: 'Plant extract', q: '250 mg' },
                      { s: 3, c: 'Jamun', b: 'Syzygium cuminii', p: 'Seed extract', q: '150 mg' },
                      { s: 4, c: 'Ashwagandha', b: 'Withania somnifera', p: 'Root extract', q: '150 mg' },
                      { s: 5, c: 'Shatawar', b: 'Asparagus racemosus', p: 'Tuberous roots extract', q: '150 mg' },
                      { s: 6, c: 'Methi', b: 'Trigonella foenum-graecum', p: 'Seeds extract', q: '150 mg' },
                      { s: 7, c: 'Amla', b: 'Emblica officinalis', p: 'Fruit juice', q: '2.5 ml' },
                      { s: 8, c: 'Harad', b: 'Terminalia chebula', p: 'Fruit pericarp extract', q: '150 mg' },
                      { s: 9, c: 'Bahera', b: 'Terminalia belerica', p: 'Fruit pericarp extract', q: '150 mg' },
                      { s: 10, c: 'Bael Pather', b: 'Aegle marmelos', p: 'Leaf extract', q: '150 mg' },
                      { s: 11, c: 'Kutaki', b: 'Picrorhiza kurroa', p: 'Root extract', q: '62.5 mg' },
                      { s: 12, c: 'Neem', b: 'Azadirachta indica', p: 'Leaves extract', q: '50 mg' },
                      { s: 13, c: 'Sonth', b: 'Zingiber officinale', p: 'Rhizome extract', q: '25 mg' },
                    ].map((row, i) => (
                      <tr key={row.s} style={{ backgroundColor: i % 2 === 1 ? '#F9FBF8' : '#ffffff', borderBottom: '1px solid #E1E9DF' }}>
                        <td style={{ padding: '0.65rem 1rem', fontWeight: 700, color: '#006B2D' }}>{row.s}</td>
                        <td style={{ padding: '0.65rem 1rem', fontWeight: 700 }}>{row.c}</td>
                        <td style={{ padding: '0.65rem 1rem', fontStyle: 'italic', color: '#17251B' }}>{row.b}</td>
                        <td style={{ padding: '0.65rem 1rem', color: '#5F6B61' }}>{row.p}</td>
                        <td style={{ padding: '0.65rem 1rem', fontWeight: 800, color: '#006B2D' }}>{row.q}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: EFFICACY (HbA1c & GLUCOSE) */}
          {activeTab === 'efficacy' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ backgroundColor: '#F3F8F1', border: '1.5px solid #C8DEC5', padding: '1.2rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#5F6B61' }}>PRIMARY ENDPOINT: HbA1c</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#006B2D', margin: '0.25rem 0' }}>-8.34% Reduction</div>
                  <div style={{ fontSize: '0.85rem', color: '#17251B' }}>
                    Decreased from <strong>7.48%</strong> to <strong>6.85%</strong> in Antox-D group (p = 0.0002 vs Placebo).
                  </div>
                </div>

                <div style={{ backgroundColor: '#F3F8F1', border: '1.5px solid #C8DEC5', padding: '1.2rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#5F6B61' }}>FASTING PLASMA GLUCOSE</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#006B2D', margin: '0.25rem 0' }}>-8.68% (119.32 mg/dL)</div>
                  <div style={{ fontSize: '0.85rem', color: '#17251B' }}>
                    Statistically significant difference vs Placebo (139.15 mg/dL) at Day 90 (p = 0.002).
                  </div>
                </div>

                <div style={{ backgroundColor: '#F3F8F1', border: '1.5px solid #C8DEC5', padding: '1.2rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#5F6B61' }}>POSTPRANDIAL GLUCOSE (PPG)</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#006B2D', margin: '0.25rem 0' }}>-15.09% Decline</div>
                  <div style={{ fontSize: '0.85rem', color: '#17251B' }}>
                    Decreased from <strong>196.43 mg/dL</strong> to <strong>166.80 mg/dL</strong> at Day 90.
                  </div>
                </div>
              </div>

              {/* Table 5 */}
              <h4 style={{ fontSize: '0.98rem', color: '#006B2D', fontWeight: 800, marginBottom: '0.5rem' }}>
                Table 5: Assessment of Change in HbA1c Levels
              </h4>
              <div style={{ overflowX: 'auto', border: '1px solid #E1E9DF', borderRadius: '10px', marginBottom: '1.5rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#006B2D', color: '#ffffff' }}>
                      <th style={{ padding: '0.7rem 1rem' }}>Visit Timepoint</th>
                      <th style={{ padding: '0.7rem 1rem' }}>Group A: Antox-D (n=50)</th>
                      <th style={{ padding: '0.7rem 1rem' }}>Group B: Placebo (n=52)</th>
                      <th style={{ padding: '0.7rem 1rem' }}>Between-Group P-Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #E1E9DF' }}>
                      <td style={{ padding: '0.7rem 1rem', fontWeight: 700 }}>Screening Baseline</td>
                      <td style={{ padding: '0.7rem 1rem' }}>7.48 ± 0.32%</td>
                      <td style={{ padding: '0.7rem 1rem' }}>7.50 ± 0.33%</td>
                      <td style={{ padding: '0.7rem 1rem' }}>p = 0.696</td>
                    </tr>
                    <tr style={{ backgroundColor: '#F3F8F1', borderBottom: '1px solid #E1E9DF' }}>
                      <td style={{ padding: '0.7rem 1rem', fontWeight: 800, color: '#006B2D' }}>Day 90 (End of Trial)</td>
                      <td style={{ padding: '0.7rem 1rem', fontWeight: 800, color: '#006B2D' }}>6.85 ± 0.36% (-8.34%)</td>
                      <td style={{ padding: '0.7rem 1rem' }}>7.30 ± 0.63% (-2.72%)</td>
                      <td style={{ padding: '0.7rem 1rem', fontWeight: 800, color: '#006B2D' }}>p = 0.0002*</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.7rem 1rem', fontWeight: 700 }}>Within-Group P-Value</td>
                      <td style={{ padding: '0.7rem 1rem', fontWeight: 800, color: '#006B2D' }}>p &lt; 0.0001*</td>
                      <td style={{ padding: '0.7rem 1rem' }}>p &lt; 0.0001*</td>
                      <td style={{ padding: '0.7rem 1rem' }}>-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: INSULIN RESISTANCE & LIPIDS */}
          {activeTab === 'insulin' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ backgroundColor: '#F3F8F1', border: '1.5px solid #C8DEC5', padding: '1.2rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#5F6B61' }}>HOMA-IR (INSULIN RESISTANCE)</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#006B2D', margin: '0.25rem 0' }}>-16.49% Reversal</div>
                  <div style={{ fontSize: '0.85rem', color: '#17251B' }}>
                    Score dropped from <strong>13.98</strong> to <strong>11.67</strong> in Antox-D, while Placebo increased by +2.77% (p = 0.0004).
                  </div>
                </div>

                <div style={{ backgroundColor: '#F3F8F1', border: '1.5px solid #C8DEC5', padding: '1.2rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#5F6B61' }}>METABOLIC SYNDROME Z-SCORE</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#006B2D', margin: '0.25rem 0' }}>-35.47% Improvement</div>
                  <div style={{ fontSize: '0.85rem', color: '#17251B' }}>
                    Z-score decreased from <strong>0.69</strong> to <strong>0.44</strong> (p = 0.027 vs Placebo).
                  </div>
                </div>

                <div style={{ backgroundColor: '#F3F8F1', border: '1.5px solid #C8DEC5', padding: '1.2rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#5F6B61' }}>LDL CHOLESTEROL</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#006B2D', margin: '0.25rem 0' }}>-7.53% Reduction</div>
                  <div style={{ fontSize: '0.85rem', color: '#17251B' }}>
                    Decreased from 116.34 mg/dL to <strong>107.58 mg/dL</strong> (p = 0.0006 vs Placebo).
                  </div>
                </div>
              </div>

              {/* Table 7 */}
              <h4 style={{ fontSize: '0.98rem', color: '#006B2D', fontWeight: 800, marginBottom: '0.5rem' }}>
                Table 7: Changes in Fasting Insulin and HOMA-IR
              </h4>
              <div style={{ overflowX: 'auto', border: '1px solid #E1E9DF', borderRadius: '10px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#006B2D', color: '#ffffff' }}>
                      <th style={{ padding: '0.7rem 1rem' }}>Metric</th>
                      <th style={{ padding: '0.7rem 1rem' }}>Baseline</th>
                      <th style={{ padding: '0.7rem 1rem' }}>Day 90 (Antox-D)</th>
                      <th style={{ padding: '0.7rem 1rem' }}>Day 90 (Placebo)</th>
                      <th style={{ padding: '0.7rem 1rem' }}>P-Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #E1E9DF' }}>
                      <td style={{ padding: '0.7rem 1rem', fontWeight: 700 }}>Fasting Insulin (mIU/L)</td>
                      <td style={{ padding: '0.7rem 1rem' }}>43.51 ± 7.66</td>
                      <td style={{ padding: '0.7rem 1rem', fontWeight: 800, color: '#006B2D' }}>39.36 ± 7.17 (-9.53%)</td>
                      <td style={{ padding: '0.7rem 1rem' }}>42.81 ± 7.32 (-2.70%)</td>
                      <td style={{ padding: '0.7rem 1rem', fontWeight: 800, color: '#006B2D' }}>p = 0.009*</td>
                    </tr>
                    <tr style={{ backgroundColor: '#F3F8F1' }}>
                      <td style={{ padding: '0.7rem 1rem', fontWeight: 700 }}>HOMA-IR Score</td>
                      <td style={{ padding: '0.7rem 1rem' }}>13.98 ± 4.00</td>
                      <td style={{ padding: '0.7rem 1rem', fontWeight: 800, color: '#006B2D' }}>11.67 ± 3.16 (-16.49%)</td>
                      <td style={{ padding: '0.7rem 1rem' }}>14.75 ± 3.60 (+2.77%)</td>
                      <td style={{ padding: '0.7rem 1rem', fontWeight: 800, color: '#006B2D' }}>p = 0.0004*</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: SAFETY DATA */}
          {activeTab === 'safety' && (
            <div>
              <div style={{
                backgroundColor: '#e2faea',
                border: '1px solid #b7ebc5',
                borderRadius: '10px',
                padding: '1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <CheckCircle2 size={24} style={{ color: '#006B2D', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 800, color: '#006B2D' }}>100% Safety Profile & Excellent Tolerability</div>
                  <div style={{ fontSize: '0.85rem', color: '#17251B' }}>
                    Zero adverse drug reactions (0 ADRs), 100% compliance rate, and all organ function parameters (liver, kidney, blood counts) remained normal throughout the 90-day intervention.
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #E1E9DF', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontWeight: 800, color: '#006B2D', marginBottom: '0.5rem' }}>🩸 Complete Blood Count (CBC)</div>
                  <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#445046' }}>
                    <li>Total Leukocyte: 7,070.83 ± 1622 (Normal)</li>
                    <li>Neutrophils: 56.24% ± 8.90 (Normal)</li>
                    <li>Lymphocytes: 32.12% ± 5.68 (Normal)</li>
                    <li>Hemoglobin: 13.90 ± 1.36 g/dL (Stable)</li>
                    <li>Platelets: 304.18 ± 72.24 (Normal)</li>
                  </ul>
                </div>

                <div style={{ backgroundColor: '#ffffff', border: '1px solid #E1E9DF', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontWeight: 800, color: '#006B2D', marginBottom: '0.5rem' }}>🧪 Liver & Kidney Function (LFT / RFT)</div>
                  <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#445046' }}>
                    <li>Bilirubin Total: 0.96 ± 0.27 mg/dL (Normal)</li>
                    <li>SGOT: 28.30 ± 5.55 U/L (Healthy)</li>
                    <li>SGPT: 33.00 ± 7.67 U/L (Healthy)</li>
                    <li>Serum Creatinine: 0.85 ± 0.25 mg/dL (Normal)</li>
                    <li>GFR: 149.60 ± 50.38 ml/min (Healthy)</li>
                  </ul>
                </div>

                <div style={{ backgroundColor: '#ffffff', border: '1px solid #E1E9DF', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontWeight: 800, color: '#006B2D', marginBottom: '0.5rem' }}>❤️ Vitals & Patient Tolerability</div>
                  <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#445046' }}>
                    <li>Blood Pressure (Systolic): 122.56 ± 5.23 mmHg</li>
                    <li>Blood Pressure (Diastolic): 78.12 ± 5.92 mmHg</li>
                    <li>Pulse Rate: 78.48 ± 5.92 bpm</li>
                    <li>Tolerability Score: <strong>03 ± 00 (Excellent)</strong></li>
                    <li>Compliance Rate: <strong>100%</strong></li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: 180-DAY EXTENSION PHASE */}
          {activeTab === 'extension' && (
            <div>
              <div style={{
                background: 'linear-gradient(135deg, #006B2D 0%, #04200e 100%)',
                color: '#ffffff',
                padding: '1.25rem',
                borderRadius: '12px',
                marginBottom: '1.25rem'
              }}>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#FFC928', marginBottom: '0.35rem' }}>
                  Annexure 1: 180-Day Extension Phase Long-Term Outcomes
                </div>
                <div style={{ fontSize: '0.88rem', color: '#e6faeb' }}>
                  18 responders continued Antox-D liquid therapy through Day 180 (6 Months) with reduced standard OHA doses. Long-term sustained glycemic control and profound insulin recovery were confirmed.
                </div>
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid #E1E9DF', borderRadius: '10px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#006B2D', color: '#ffffff' }}>
                      <th style={{ padding: '0.7rem 1rem' }}>Key Biomarker</th>
                      <th style={{ padding: '0.7rem 1rem' }}>Baseline (Day 1)</th>
                      <th style={{ padding: '0.7rem 1rem' }}>Day 90</th>
                      <th style={{ padding: '0.7rem 1rem' }}>Day 180 (6 Months)</th>
                      <th style={{ padding: '0.7rem 1rem' }}>Overall Improvement</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #E1E9DF' }}>
                      <td style={{ padding: '0.7rem 1rem', fontWeight: 700 }}>Fasting Glucose (FPG)</td>
                      <td style={{ padding: '0.7rem 1rem' }}>126.44 ± 16.92 mg/dL</td>
                      <td style={{ padding: '0.7rem 1rem' }}>121.44 ± 16.30 mg/dL</td>
                      <td style={{ padding: '0.7rem 1rem', fontWeight: 800, color: '#006B2D' }}>110.61 ± 7.75 mg/dL</td>
                      <td style={{ padding: '0.7rem 1rem', fontWeight: 800, color: '#006B2D' }}>-12.52% (p = 0.001*)</td>
                    </tr>
                    <tr style={{ backgroundColor: '#F3F8F1', borderBottom: '1px solid #E1E9DF' }}>
                      <td style={{ padding: '0.7rem 1rem', fontWeight: 700 }}>Postprandial Glucose (PPG)</td>
                      <td style={{ padding: '0.7rem 1rem' }}>187.87 ± 37.86 mg/dL</td>
                      <td style={{ padding: '0.7rem 1rem' }}>157.44 ± 26.25 mg/dL</td>
                      <td style={{ padding: '0.7rem 1rem', fontWeight: 800, color: '#006B2D' }}>136.17 ± 13.61 mg/dL</td>
                      <td style={{ padding: '0.7rem 1rem', fontWeight: 800, color: '#006B2D' }}>-27.52% (p &lt; 0.0001*)</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #E1E9DF' }}>
                      <td style={{ padding: '0.7rem 1rem', fontWeight: 700 }}>Glycated Hemoglobin (HbA1c)</td>
                      <td style={{ padding: '0.7rem 1rem' }}>7.39 ± 0.24%</td>
                      <td style={{ padding: '0.7rem 1rem' }}>6.63 ± 0.23%</td>
                      <td style={{ padding: '0.7rem 1rem', fontWeight: 800, color: '#006B2D' }}>6.27 ± 0.53%</td>
                      <td style={{ padding: '0.7rem 1rem', fontWeight: 800, color: '#006B2D' }}>-15.11% (p &lt; 0.0001*)</td>
                    </tr>
                    <tr style={{ backgroundColor: '#F3F8F1', borderBottom: '1px solid #E1E9DF' }}>
                      <td style={{ padding: '0.7rem 1rem', fontWeight: 700 }}>Fasting Insulin</td>
                      <td style={{ padding: '0.7rem 1rem' }}>38.73 ± 11.29 mIU/L</td>
                      <td style={{ padding: '0.7rem 1rem' }}>35.48 ± 9.95 mIU/L</td>
                      <td style={{ padding: '0.7rem 1rem', fontWeight: 800, color: '#006B2D' }}>18.93 ± 3.05 mIU/L</td>
                      <td style={{ padding: '0.7rem 1rem', fontWeight: 800, color: '#006B2D' }}>-51.13% Recovery</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.7rem 1rem', fontWeight: 700 }}>HOMA-IR Resistance Score</td>
                      <td style={{ padding: '0.7rem 1rem' }}>13.63 ± 3.57</td>
                      <td style={{ padding: '0.7rem 1rem' }}>10.48 ± 2.84</td>
                      <td style={{ padding: '0.7rem 1rem', fontWeight: 800, color: '#006B2D' }}>5.02 ± 1.03</td>
                      <td style={{ padding: '0.7rem 1rem', fontWeight: 800, color: '#006B2D' }}>-63.18% Deep Recovery</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div style={{
          padding: '0.9rem 1.4rem',
          backgroundColor: '#F3F8F1',
          borderTop: '1px solid #D5E5D3',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ fontSize: '0.82rem', color: '#5F6B61' }}>
            <span>Verified Document Ref: </span>
            <strong style={{ color: '#006B2D' }}>CTRI/2025/10/095664</strong>
            <span> | Sponsor: Nutrifeel Health Products Pvt. Ltd.</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <a
              href="/reports/Antox-D-Clinical-Study-Report.html"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              style={{ borderColor: '#006B2D', color: '#006B2D', textDecoration: 'none' }}
            >
              <ExternalLink size={14} />
              <span>{language === 'mr' ? 'नवीन टॅबमध्ये उघडा' : 'Open in New Tab'}</span>
            </a>

            <button
              onClick={onClose}
              className="btn btn-primary btn-sm"
            >
              <span>{language === 'mr' ? 'बंद करा' : 'Close Reader'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicalStudyReportModal;
