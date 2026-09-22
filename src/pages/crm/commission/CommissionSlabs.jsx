// Commission Slab Rules Configurator & Sandbox Simulator for Samarth Kolhapur CRM
import React, { useState, useEffect } from 'react';
import { 
  Percent, Plus, Trash2, Edit, Save, Calculator, 
  AlertTriangle, CheckCircle2, RotateCcw, Info 
} from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import { validateCommissionSlabs } from '../../../utils/validators';
import { calculateCommission } from '../../../services/commissionEngine';
import { dbService } from '../../../services/db';

export default function CommissionSlabs() {
  const [slabs, setSlabs] = useState([]);
  const [settings, setSettings] = useState({});
  const [calcType, setCalcType] = useState('flat');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Simulator state
  const [simSalesAmount, setSimSalesAmount] = useState(150000);

  useEffect(() => {
    const unsub = dbService.subscribe('commissionSlabs', (loadedSlabs) => {
      setSlabs(loadedSlabs);
    });
    const currentSettings = dbService.getAll('settings');
    setSettings(currentSettings);
    setCalcType(currentSettings.commissionCalculationType || 'flat');

    return unsub;
  }, []);

  const handleAddSlab = () => {
    const lastSlab = slabs[slabs.length - 1];
    const newMin = lastSlab ? Number(lastSlab.maxAmount || 0) + 1 : 0;
    const newSlab = {
      id: `slab_${Date.now()}`,
      name: `Slab ${slabs.length + 1}`,
      minAmount: newMin,
      maxAmount: newMin + 50000,
      ratePercentage: lastSlab ? Number(lastSlab.ratePercentage) + 2 : 2
    };
    setSlabs([...slabs, newSlab]);
  };

  const handleUpdateSlab = (idx, field, value) => {
    const updated = [...slabs];
    updated[idx] = {
      ...updated[idx],
      [field]: field === 'name' ? value : value === '' ? null : Number(value)
    };
    setSlabs(updated);
    setErrorMsg('');
  };

  const handleDeleteSlab = (idx) => {
    if (slabs.length <= 1) {
      setErrorMsg('At least one commission slab must exist.');
      return;
    }
    const updated = slabs.filter((_, i) => i !== idx);
    setSlabs(updated);
  };

  const handleSaveConfiguration = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    // Validate slabs
    const validation = validateCommissionSlabs(slabs);
    if (!validation.valid) {
      setErrorMsg(validation.error);
      return;
    }

    // Persist slabs in DB
    try {
      await dbService.setCollection('commissionSlabs', validation.sortedSlabs);
      await dbService.update('settings', 'company_settings', {
        commissionCalculationType: calcType
      });

      setSlabs(validation.sortedSlabs);
      setSuccessMsg('Commission slabs and calculation rules successfully updated & saved!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e) {
      setErrorMsg('Failed to save settings: ' + e.message);
    }
  };

  // Run simulation calculations
  const flatResult = calculateCommission(simSalesAmount, slabs, 'flat');
  const progResult = calculateCommission(simSalesAmount, slabs, 'progressive');

  return (
    <div>
      {/* Header */}
      <div className="crm-page-header">
        <div>
          <h1 className="crm-page-title">
            <Percent size={24} style={{ color: '#1b4d3e' }} /> Slab Rules & Calculation Engine
          </h1>
          <div className="crm-page-subtitle">
            Configure dynamic tiered commission rates, calculation method, and test with live sales amounts
          </div>
        </div>

        <div className="crm-header-btn-group">
          <button className="crm-btn crm-btn-primary" onClick={handleSaveConfiguration}>
            <Save size={16} /> Save All Changes
          </button>
        </div>
      </div>

      {errorMsg && (
        <div style={{ padding: '0.85rem 1.25rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#991b1b', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={18} />
          <strong>{errorMsg}</strong>
        </div>
      )}

      {successMsg && (
        <div style={{ padding: '0.85rem 1.25rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', color: '#065f46', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} />
          <strong>{successMsg}</strong>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.5rem' }}>
        {/* Slabs Configuration Box */}
        <div>
          {/* Calculation Type Toggle */}
          <div className="crm-card" style={{ marginBottom: '1.5rem' }}>
            <div className="crm-card-header">
              <h3 className="crm-card-title">
                <Calculator size={18} style={{ color: '#1b4d3e' }} /> Commission Calculation Method
              </h3>
            </div>
            <div className="crm-card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: '10px',
                    border: `2px solid ${calcType === 'flat' ? '#1b4d3e' : '#e2e8f0'}`,
                    background: calcType === 'flat' ? '#e8f4f0' : '#ffffff',
                    cursor: 'pointer'
                  }}
                  onClick={() => setCalcType('flat')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>A. Flat Slab</strong>
                    <input type="radio" checked={calcType === 'flat'} onChange={() => setCalcType('flat')} />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px' }}>
                    The entire eligible sales amount is multiplied by the single highest matching slab percentage.
                  </div>
                </div>

                <div
                  style={{
                    padding: '1rem',
                    borderRadius: '10px',
                    border: `2px solid ${calcType === 'progressive' ? '#1b4d3e' : '#e2e8f0'}`,
                    background: calcType === 'progressive' ? '#e8f4f0' : '#ffffff',
                    cursor: 'pointer'
                  }}
                  onClick={() => setCalcType('progressive')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>B. Progressive Slab</strong>
                    <input type="radio" checked={calcType === 'progressive'} onChange={() => setCalcType('progressive')} />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px' }}>
                    Calculates commission iteratively portion-by-portion across each qualifying tier bracket.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slabs Table Editor */}
          <div className="crm-card">
            <div className="crm-card-header">
              <h3 className="crm-card-title">
                <Percent size={18} style={{ color: '#c69214' }} /> Commission Slabs Configuration
              </h3>
              <button className="crm-btn crm-btn-secondary crm-btn-sm" onClick={handleAddSlab}>
                <Plus size={14} /> Add Slab Tier
              </button>
            </div>
            <div className="crm-card-body" style={{ padding: 0 }}>
              <div className="crm-table-wrapper">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Slab Label</th>
                      <th>Min Amount (₹)</th>
                      <th>Max Amount (₹)</th>
                      <th>Commission (%)</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slabs.map((slab, idx) => (
                      <tr key={slab.id || idx}>
                        <td>
                          <input
                            type="text"
                            className="crm-input"
                            style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                            value={slab.name}
                            onChange={(e) => handleUpdateSlab(idx, 'name', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="crm-input"
                            style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                            value={slab.minAmount ?? ''}
                            onChange={(e) => handleUpdateSlab(idx, 'minAmount', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            placeholder="No limit"
                            className="crm-input"
                            style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                            value={slab.maxAmount ?? ''}
                            onChange={(e) => handleUpdateSlab(idx, 'maxAmount', e.target.value)}
                          />
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input
                              type="number"
                              step="0.1"
                              className="crm-input"
                              style={{ width: '70px', padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                              value={slab.ratePercentage ?? ''}
                              onChange={(e) => handleUpdateSlab(idx, 'ratePercentage', e.target.value)}
                            />
                            <span>%</span>
                          </div>
                        </td>
                        <td>
                          <button
                            className="crm-icon-btn"
                            style={{ width: '28px', height: '28px', color: '#ef4444' }}
                            onClick={() => handleDeleteSlab(idx)}
                            title="Delete Slab"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Live Simulator & Comparison Sandbox */}
        <div>
          <div className="crm-card" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
            <div className="crm-card-header" style={{ background: '#ffffff' }}>
              <h3 className="crm-card-title">
                <Calculator size={18} style={{ color: '#1b4d3e' }} /> Live Commission Sandbox
              </h3>
            </div>
            <div className="crm-card-body">
              <div className="crm-form-group">
                <label className="crm-form-label">Test Monthly Sales Volume (₹)</label>
                <input
                  type="number"
                  step="5000"
                  className="crm-input"
                  style={{ fontSize: '1.1rem', fontWeight: 700 }}
                  value={simSalesAmount}
                  onChange={(e) => setSimSalesAmount(Number(e.target.value))}
                />
              </div>

              {/* Active Selection Result */}
              <div style={{ padding: '1.25rem', background: '#1b4d3e', color: '#ffffff', borderRadius: '10px', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>
                  Result with Active Selection ({calcType.toUpperCase()} SLAB)
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px' }}>
                  {formatCurrency(calcType === 'flat' ? flatResult.totalCommission : progResult.totalCommission)}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px' }}>
                  Effective Rate: {calcType === 'flat' ? flatResult.appliedRate : progResult.appliedRate}%
                </div>
              </div>

              {/* Comparison Breakdown Table */}
              <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', color: '#1e293b' }}>
                  Side-by-Side Comparison:
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                  <span>Flat Slab Commission:</span>
                  <strong>{formatCurrency(flatResult.totalCommission)} ({flatResult.appliedRate}%)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontSize: '0.85rem' }}>
                  <span>Progressive Slab Commission:</span>
                  <strong>{formatCurrency(progResult.totalCommission)} ({progResult.appliedRate}%)</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
