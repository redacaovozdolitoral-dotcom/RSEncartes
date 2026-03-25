// components/LogoBrilho.jsx
import React from 'react';
import LogoLoading from '../imagens/logo_loading.svg'

export default function Loading() {
  return (

      <div className="logo-circle">
      
      <div className="logo-loading">
          <img src={LogoLoading} alt="Logo" />
      </div>

     </div>

  );
}
