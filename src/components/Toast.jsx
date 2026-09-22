import React from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Toast = () => {
  const { toastMessage, setToastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="toast-container">
      <CheckCircle2 size={20} style={{ color: '#34d399', flexShrink: 0 }} />
      <span style={{ flex: 1, fontWeight: 500 }}>{toastMessage}</span>
      <button
        onClick={() => setToastMessage(null)}
        style={{
          background: 'none',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
