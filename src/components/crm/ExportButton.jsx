// CSV and Print Export Utility for CRM Tables and Reports
import React from 'react';
import { Download, Printer } from 'lucide-react';

export default function ExportButton({ data = [], filename = 'export', columns = [], title = 'Export CSV' }) {
  const exportToCsv = () => {
    if (!data.length) return;

    const headers = columns.length 
      ? columns.map((col) => col.header)
      : Object.keys(data[0]);

    const keys = columns.length 
      ? columns.map((col) => col.key)
      : Object.keys(data[0]);

    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of data) {
      const values = keys.map((key) => {
        let val = row[key];
        if (typeof val === 'object' && val !== null) {
          val = JSON.stringify(val);
        }
        const escaped = ('' + (val ?? '')).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
      <button className="crm-btn crm-btn-secondary crm-btn-sm" onClick={exportToCsv} title="Download CSV Spreadsheet">
        <Download size={14} />
        {title}
      </button>
      <button className="crm-btn crm-btn-secondary crm-btn-sm" onClick={handlePrint} title="Print or Save PDF">
        <Printer size={14} />
      </button>
    </div>
  );
}
