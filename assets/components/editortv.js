import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import html2canvas from 'html2canvas';
import Precos from './precos';
import AjusteLogo from './ajustelogo.js';
import WaterMark from '../imagens/watermark.png';

const EditorTV = forwardRef(({watermark, wrapperRef, containerRef, setZoom, formatoEncarte, dadosencarte, setDadosEncarte, produtos, estiloencarte, templateAtivo, zoom }, ref) => {
  const imagemRef = useRef(null);
  const produtoRef = useRef(null);
  const intervalRef = useRef(null);

  const [produtoAtual, setProdutoAtual] = useState(0);
  const [animar, setAnimar] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [gerando, setGerando] = useState(false);

  
  const FORMATOS_TV = {
  tvhorizontal: {
    width: 1600,
    height: 900,
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr',
    produtosPorPagina: 6
  },
  tvvertical: {
    width: 900,
    height: 1600,
    gridTemplateColumns: '1fr',
    gridTemplateRows: '1fr 1fr',
    produtosPorPagina: 4
  }
};


const config = FORMATOS_TV[formatoEncarte] || FORMATOS_TV.tvhorizontal;

  //ajustar a pagina scale
  useEffect(() => {
    const ajustarEscalaPorLarguraEAltura = () => {
      if (!wrapperRef.current || !containerRef.current) return;

      const wrapperWidth = wrapperRef.current.clientWidth;
      const wrapperHeight = wrapperRef.current.clientHeight;

      const containerWidth = containerRef.current.scrollWidth;
      const containerHeight = containerRef.current.scrollHeight;

      const escalaLargura = wrapperWidth / containerWidth;
      const escalaAltura = wrapperHeight / containerHeight;
      const novaEscala = Math.min(escalaLargura, escalaAltura, 1);
      setZoom(novaEscala);
    };

    ajustarEscalaPorLarguraEAltura();
  }, [formatoEncarte]);

  const produtosPorPagina = 6;

  // função para avançar produto (usada pelo interval)
  const advanceProduct = () => {
    setFadeOut(true);
    setTimeout(() => {
      setProdutoAtual(prev => (prev + 1) % produtos.length);
      setFadeOut(false);
      setAnimar(true);
      setTimeout(() => setAnimar(false), 1000);
    }, 500);
  };

  // slideshow: respeita gerando (pausado enquanto gerando)
  useEffect(() => {
    // limpa qualquer interval anterior
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (gerando) return; // pausa slideshow durante geração

    intervalRef.current = setInterval(() => {
      advanceProduct();
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [produtos.length, gerando]);

  // Captura uma div como Blob PNG em widthxheight
  async function captureDiv(ref, width, height, isBackground = false) {
    const clone = ref.current.cloneNode(true);

    // Função para desativar animações e transições em um elemento e seus filhos
    const disableAnimations = (element) => {
      element.style.animation = 'none';
      element.style.transition = 'none';
      Array.from(element.children).forEach(disableAnimations);
    };

    // Ocultar #produto e #imagem apenas quando for o background
    if (isBackground) {
      const produtoDiv = clone.querySelector('#produto');
      const imagemDiv = clone.querySelector('#imagem');
      if (produtoDiv) produtoDiv.style.display = 'none';
      if (imagemDiv) imagemDiv.style.display = 'none';
    }

    clone.style.width     = `${width}px`;
    clone.style.height    = `${height}px`;
    clone.style.transform = 'none';
    clone.style.position = 'absolute';
    clone.style.top = '-9999px';
    clone.style.left = '-9999px';
    clone.style.zIndex = '-1';

    // Desabilitar animações em todo o clone e seus filhos
    disableAnimations(clone);

    document.body.appendChild(clone);

    const canvas = await html2canvas(clone, {
      width,
      height,
      useCORS: true,
      scale: 1.2,
      backgroundColor: null,
    });

    document.body.removeChild(clone);

    return new Promise((resolve) => {
      canvas.toBlob(blob => resolve(blob), 'image/png');
    });
  }

  // garante que uma imagem URL foi carregada (resolves mesmo em erro)
  function ensureImageLoaded(url) {
    return new Promise((res) => {
      if (!url) return res();
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => res();
      img.onerror = () => res(); // continua mesmo se erro (evita travar)
      img.src = url;
      // caso já esteja em cache, onload dispara imediatamente
    });
  }

  async function handleGenerateVideo() {
    try {
      // marca gerando e pausa slideshow
      setGerando(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // desliga animações visuais na UI (opcional)
      if (containerRef?.current) containerRef.current.classList?.add('no-anim');
      setAnimar(false);
      setFadeOut(false);

      // força um render e frame antes de começar
      await new Promise(resolve => requestAnimationFrame(resolve));
      await new Promise(resolve => setTimeout(resolve, 150));

      // captura background
      const bgBlob = await captureDiv(
      containerRef,
      config.width,
      config.height,
      true
    );

      const formData = new FormData();
      formData.append('background', bgBlob, 'background.png');

      // itera por todos os produtos garantindo que o DOM exibido esteja pronto antes de capturar
      for (let i = 0; i < produtos.length; i++) {
        // atualiza o estado para marcar destaque na UI (visível ao usuário)
        setProdutoAtual(i);

        // espera o próximo frame (render) e um pequeno atraso para React aplicar alterações
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => setTimeout(resolve, 200));

        // garante que a imagem de produto carregou no browser (previne captura em branco)
        const urlImagem = produtos[i]?.imagem;
        await ensureImageLoaded(urlImagem);

        // captura imagem e produto (ambos são refs separados no seu layout)
        const imgBlob  = await captureDiv(imagemRef, 740, 500);
        const prodBlob = await captureDiv(produtoRef, 740, 500);

        formData.append(`imagem_${i}`, imgBlob, `imagem_${i}.png`);
        formData.append(`produto_${i}`, prodBlob, `produto_${i}.png`);
      }

      formData.append('formato', formatoEncarte);


      // envia para o backend
      const response = await fetch('https://enkartes.com/api/gerarVideo.php', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Erro no servidor');
      const mp4Blob = await response.blob();

      const url = URL.createObjectURL(mp4Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'encarte.mp4';
      a.click();

    } catch (err) {
      console.error(err);
      alert('Falha ao gerar vídeo: ' + (err?.message || err));
    } finally {
      // restaura slideshow e animações
      setGerando(false);
      if (containerRef?.current) containerRef.current.classList?.remove('no-anim');

      // reinicia o interval (useEffect vai observar gerando e recriar o interval automaticamente)
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }

  useImperativeHandle(ref, () => ({
    generateVideo: handleGenerateVideo
  }));

  // Cálculo do contraste de cor (mantive igual)
  function getContrastColor(backgroundColor) {
    const tempDiv = document.createElement('div');
    tempDiv.style.color = backgroundColor;
    document.body.appendChild(tempDiv);
    const computedColor = getComputedStyle(tempDiv).color;
    document.body.removeChild(tempDiv);
    const rgb = computedColor.match(/\d+/g).map(Number);
    const [r, g, b] = rgb.map(c => {
      const channel = c / 255;
      return channel <= 0.03928
        ? channel / 12.92
        : Math.pow((channel + 0.055) / 1.055, 2.4);
    });
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }

  const paginaAtual = Math.floor(produtoAtual / produtosPorPagina);
  const produtosVisiveis = produtos.slice(
    paginaAtual * produtosPorPagina,
    paginaAtual * produtosPorPagina + produtosPorPagina
  );

  return (
    <>
      <div
          id="encarte-container"
          ref={containerRef}
          style={{
            ...estiloencarte,
            width: `${config.width}px`,
            height: `${config.height}px`,
            backgroundImage: `url(${templateAtivo.planoFundo})`,
            backgroundSize: 'cover',
            position: 'absolute',
            left: '50%',
            transform: `translateX(-50%) scale(${zoom})`,
            transformOrigin: 'top center'
          }}
>
        {(watermark) && (
          <img src={WaterMark} className="watermark"/>
        )}

        <div className="topoEncarte position-relative">
           {dadosencarte.logo && (<div id="logo" className="position-absolute"><AjusteLogo 
                logo={dadosencarte.logo} 
                dadosencarte={dadosencarte}
                setDadosEncarte={setDadosEncarte}
                /></div>)}
        </div>

    <div
  style={{
    display: 'grid',
    gridTemplateColumns: config.gridTemplateColumns,
    gridTemplateRows: config.gridTemplateRows,
    gap: '20px',
    padding: '20px',
    height: '100%'
  }}
>

        <div
            id="produto"
            ref={produtoRef}
            style={{
              gridRow: formatoEncarte === 'tvvertical' ? '2' : 'auto',
              backgroundColor: templateAtivo.corFundo,
              borderRadius: '8px',
              padding: '15px',
              overflowY: 'auto'
            }}
          >
            {produtosVisiveis.map((prod, index) => {
              const realIndex = paginaAtual * produtosPorPagina + index;
              return (
                <div
                  key={realIndex}
                  className={`produto-titulo ${realIndex === produtoAtual ? 'destaque' : ''}`}
                  style={{
                    padding: '12px',
                    margin: '8px 0',
                    fontSize: '30px',
                    fontWeight: '600',
                    backgroundColor: realIndex === produtoAtual ? templateAtivo.corEtiqueta : 'transparent',
                    color: realIndex === produtoAtual
                      ? getContrastColor(templateAtivo.corEtiqueta)
                      : getContrastColor(templateAtivo.corFundo),
                    borderRadius: '4px',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <span>{prod.titulo}</span>
                </div>
              );
            })}
          </div>

         <div
  id="imagem"
  ref={imagemRef}
  style={{
    gridRow: formatoEncarte === 'tvvertical' ? '1' : 'auto',
    backgroundColor: templateAtivo.corFundo,
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    position: 'relative'
  }}
>
            <div
              className="imagem-container imagem-produto"
              style={{
                width: '100%',
                height: '100%',
                backgroundImage: `url(${produtos[produtoAtual]?.imagem})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              }}
            />

            <div
              className="preco-produto"
              style={{
                position: 'absolute',
                right: '10px',
                bottom: '10px',
              }}
            >
              {produtos[produtoAtual] && (
                <Precos
                  produto={produtos[produtoAtual]}
                  colorFont={getContrastColor}
                  templateAtivo={templateAtivo}
                  fontSize={{ width: '300', height: '150', fontSize: '70' }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default EditorTV;
