// Universal Accessible Modal for CRM
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function CrmModal({ isOpen, onClose, title, children, footer, size = 'default' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="crm-modal-backdrop" onClick={onClose}>
      <div 
        className={`crm-modal ${size === 'lg' ? 'crm-modal-lg' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="crm-modal-header">
          <h3 className="crm-card-title">{title}</h3>
          <button className="crm-icon-btn" onClick={onClose} title="Close Modal">
            <X size={18} />
          </button>
        </div>
        <div className="crm-modal-body">
          {children}
        </div>
        {footer && (
          <div className="crm-modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
