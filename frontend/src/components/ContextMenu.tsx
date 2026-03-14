import React, { useEffect, useRef } from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onEdit, onDelete, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Adjust position so menu doesn't go off-screen
  const adjustedX = Math.min(x, window.innerWidth - 160);
  const adjustedY = Math.min(y, window.innerHeight - 100);

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed', left: adjustedX, top: adjustedY,
        background: '#fff', borderRadius: '10px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #F3F4F6', zIndex: 9999, minWidth: '150px',
        overflow: 'hidden', animation: 'fadeIn 0.1s ease',
      }}
    >
      <button
        onClick={() => { onEdit(); onClose(); }}
        style={menuItemStyle}
        onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <span style={{ fontSize: '16px' }}>✏️</span>
        <span>Edit</span>
      </button>
      <div style={{ height: '1px', background: '#F3F4F6' }} />
      <button
        onClick={() => { onDelete(); onClose(); }}
        style={{ ...menuItemStyle, color: '#EF4444' }}
        onMouseEnter={e => (e.currentTarget.style.background = '#FFF5F5')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <span style={{ fontSize: '16px' }}>🗑️</span>
        <span>Delete</span>
      </button>
    </div>
  );
};

const menuItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '10px',
  padding: '10px 16px', width: '100%', border: 'none',
  background: 'transparent', cursor: 'pointer', fontSize: '14px',
  fontWeight: 500, color: '#374151', textAlign: 'left',
  transition: 'background 0.1s',
};

// ─── Delete Confirmation Dialog ───────────────────────────────────────────────

interface DeleteConfirmProps {
  orderId: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirm: React.FC<DeleteConfirmProps> = ({ orderId, onConfirm, onCancel }) => (
  <div
    style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, backdropFilter: 'blur(2px)',
    }}
    onClick={e => e.target === e.currentTarget && onCancel()}
  >
    <div style={{
      background: '#fff', borderRadius: '16px', padding: '2rem',
      maxWidth: '420px', width: '90%', textAlign: 'center',
      boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
    }}>
      <div style={{
        width: '56px', height: '56px', borderRadius: '50%',
        background: '#FEE2E2', display: 'flex', alignItems: 'center',
        justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '24px',
      }}>🗑️</div>
      <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#111827' }}>
        Delete Order
      </h3>
      <p style={{ margin: '0 0 1.5rem', fontSize: '14px', color: '#6B7280', lineHeight: 1.6 }}>
        Are you sure you want to delete <strong>{orderId}</strong>?<br />
        This action cannot be undone.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
        <button
          onClick={onCancel}
          style={{
            padding: '0.6rem 1.5rem', borderRadius: '8px', border: '1.5px solid #E5E7EB',
            background: '#fff', color: '#374151', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
          }}
        >Cancel</button>
        <button
          onClick={onConfirm}
          style={{
            padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none',
            background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
            color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          }}
        >Delete Order</button>
      </div>
    </div>
  </div>
);
