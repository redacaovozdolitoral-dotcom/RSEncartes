
import React from 'react';

const Alerta = ({ mensagem }) => {
  if (!mensagem) return null;

  return (
    <div style={{
        position: 'absolute',
        width:"300px",
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#f09a05',
        fontWeight:'600',
        fontSize:'13px',
        color: 'black',
        padding: '10px 20px',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0,0,0,0.2)',
        zIndex: 1000
      }}>
      {mensagem}
    </div>
  );
};

export default Alerta;
