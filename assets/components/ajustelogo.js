import React, { useState, useRef, useEffect } from 'react';
import Moveable from 'react-moveable';

const DragImage = ({ logo, setDadosEncarte, dadosencarte }) => {
  const [logoInfo, setLogoInfo] = useState({
    x: 650,
    y: 60,
    width: 300,
  });
  const [target, setTarget] = useState(null);
  const [isResizable, setIsResizable] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const imageRef = useRef(null);
  const isMobile = window.innerWidth <= 768;
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && dadosencarte && imageRef.current) {
      setLogoInfo({
        x: parseInt(dadosencarte.logo_x),
        y: parseInt(dadosencarte.logo_y),
        width: parseInt(dadosencarte.logo_width),
      });
      initialized.current = true;
    }
  }, [dadosencarte]);

  const onDrag = (e) => {
    setLogoInfo((prev) => ({ ...prev, x: e.left, y: e.top }));
  };

  const onDragEnd = () => {
    saveData();
  };

const onResize = (e) => {
  if (imageRef.current) {
    const { width, height, drag } = e;

    // Atualiza a largura
    imageRef.current.style.width = `${width}px`;

    // Atualiza posição (caso o ponto de redimensionamento tenha movido o elemento)
    imageRef.current.style.left = `${drag.left}px`;
    imageRef.current.style.top = `${drag.top}px`;

    setLogoInfo((prev) => ({
      ...prev,
      x: drag.left,
      y: drag.top,
      width,
    }));
  }
};

  const onResizeEnd = () => {
    saveData();
  };

  const saveData = () => {
    setDadosEncarte((prev) => ({
      ...prev,
      logo_x: logoInfo.x,
      logo_y: logoInfo.y,
      logo_width: logoInfo.width,
    }));

    fetch('https://enkartes.com/api/posicaoLogo.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: dadosencarte.id,
        x: logoInfo.x,
        y: logoInfo.y,
        width: logoInfo.width,
      }),
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (imageRef.current && !imageRef.current.contains(event.target)) {
        setIsResizable(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div style={{ width: '100%', height: 400, overflow: 'hidden', touchAction: 'none' }}>
      <img
        ref={(el) => {
          imageRef.current = el;
        }}
        onLoad={() => {
          setTarget(imageRef.current);
          setIsReady(true);
        }}
        src={logo}
        className={`bg-logo-${dadosencarte.bordalogo}`}
        alt="Logo"
        style={{
          position: 'absolute',
          left: `${logoInfo.x}px`,
          top: `${logoInfo.y}px`,
          width: `${logoInfo.width}px`,
          cursor: 'move',
          zIndex: '9999',
        }}
        onPointerDown={() => {
          setIsResizable(true);
        }}
      />

      {isReady && target && (
        <Moveable
          target={target}
          draggable={true}
          resizable={isResizable}
          keepRatio={true}
          onDrag={onDrag}
          onDragEnd={onDragEnd}
          onResize={onResize}
          onResizeEnd={onResizeEnd}
          origin={false}
          hideDefaultLines={!isResizable}
          padding={{ left: 50, top: 50, right: 50, bottom: 50 }}
          zoom={isMobile ? 5 : 3}
          throttleDrag={1}
          throttleResize={1}
        />
      )}
    </div>
  );
};

export default DragImage;
