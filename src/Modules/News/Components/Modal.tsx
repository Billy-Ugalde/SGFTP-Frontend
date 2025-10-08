import React from 'react';

type Props = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

const Modal: React.FC<Props> = ({ title, onClose, children }) => {
  return (
    <div style={overlay}>
      <div style={dialog}>
        <div style={header}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button type="button" onClick={onClose} style={closeBtn}>×</button>
        </div>
        <div style={{ padding: '12px 16px' }}>{children}</div>
      </div>
    </div>
  );
};

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', zIndex: 9999,
};
const dialog: React.CSSProperties = {
  width: 'min(720px, 92vw)', background: '#fff', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,.2)',
};
const header: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '12px 16px', borderBottom: '1px solid #eee',
};
const closeBtn: React.CSSProperties = {
  border: 'none', background: 'transparent', fontSize: 22, cursor: 'pointer', lineHeight: 1,
};

export default Modal;
