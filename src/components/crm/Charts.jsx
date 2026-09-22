// Modern Clean SVG Charts for Samarth Kolhapur CRM Dashboard & Analytics
import React from 'react';
import { formatCurrency } from '../../utils/formatters';

export function SalesBarChart({ data = [] }) {
  // data format: [{ label: 'May', value: 120000, commission: 8400 }]
  const sampleData = data.length ? data : [
    { label: 'Apr 26', value: 280000, commission: 19600 },
    { label: 'May 26', value: 340000, commission: 23800 },
    { label: 'Jun 26', value: 410000, commission: 32800 },
    { label: 'Jul 26', value: 390000, commission: 27300 },
    { label: 'Aug 26', value: 460000, commission: 36800 },
    { label: 'Sep 26', value: 485000, commission: 48500 }
  ];

  const maxVal = Math.max(...sampleData.map((d) => d.value), 500000);
  const chartHeight = 200;

  return (
    <div style={{ width: '100%', padding: '1rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', height: chartHeight, gap: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>
        {sampleData.map((item, idx) => {
          const heightPercent = (item.value / maxVal) * 100;
          return (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#1b4d3e', marginBottom: '4px' }}>
                ₹{(item.value / 1000).toFixed(0)}k
              </div>
              <div
                style={{
                  width: '100%',
                  maxWidth: '44px',
                  height: `${heightPercent}%`,
                  background: 'linear-gradient(180deg, #1b4d3e 0%, #2a6b57 100%)',
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.4s ease'
                }}
                title={`Sales: ${formatCurrency(item.value)} | Commission: ${formatCurrency(item.commission)}`}
              />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
        {sampleData.map((item, idx) => (
          <div key={idx} style={{ flex: 1, textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LeadSourceDonut({ data = [] }) {
  const sources = data.length ? data : [
    { label: 'Website Form', count: 42, color: '#1b4d3e' },
    { label: 'WhatsApp', count: 35, color: '#10b981' },
    { label: 'Affiliate Referrals', count: 28, color: '#c69214' },
    { label: 'Social Media', count: 20, color: '#0284c7' },
    { label: 'Walk-in / Phone', count: 15, color: '#8b5cf6' }
  ];

  const total = sources.reduce((sum, s) => sum + s.count, 0);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', padding: '1rem 0' }}>
      {/* Visual Bar Breakdown */}
      <div style={{ flex: 1, minWidth: '220px' }}>
        <div style={{ display: 'flex', height: '18px', borderRadius: '999px', overflow: 'hidden', marginBottom: '1.25rem', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}>
          {sources.map((s, idx) => (
            <div
              key={idx}
              style={{
                width: `${(s.count / total) * 100}%`,
                background: s.color
              }}
              title={`${s.label}: ${s.count} (${Math.round((s.count / total) * 100)}%)`}
            />
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {sources.map((s, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: s.color }} />
                <span style={{ color: '#334155', fontWeight: 500 }}>{s.label}</span>
              </div>
              <div style={{ fontWeight: 600, color: '#1e293b' }}>
                {s.count} <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({Math.round((s.count / total) * 100)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ConversionFunnel() {
  const steps = [
    { label: 'Website Inquiries & Leads', count: 140, pct: '100%', color: '#0284c7' },
    { label: 'Counselor Contacted', count: 105, pct: '75%', color: '#2a6b57' },
    { label: 'Interested & Quotation', count: 72, pct: '51%', color: '#1b4d3e' },
    { label: 'Converted & Order Placed', count: 58, pct: '41%', color: '#10b981' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem 0' }}>
      {steps.map((step, idx) => (
        <div key={idx}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
            <span style={{ fontWeight: 600, color: '#334155' }}>{step.label}</span>
            <span style={{ fontWeight: 700, color: step.color }}>{step.count} ({step.pct})</span>
          </div>
          <div style={{ height: '12px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ width: step.pct, height: '100%', background: step.color, borderRadius: '6px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
