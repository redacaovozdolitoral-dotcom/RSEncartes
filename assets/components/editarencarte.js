import React, { useEffect, useState, useRef } from 'react';
import WaterMark from '../imagens/watermark.png';
import AjusteLogo from './ajustelogo.js';
import Precos from './precos.js';
import loading from '../imagens/loading.gif';



const EditorEncarte = ({wrapperRef, containerRef, setProdutoEditando, setVisivel, formatoEncarte, dadosencarte, zoom, setZoom, templateAtivo, estiloencarte, watermark, paginarprodutos, setDadosEncarte, setEncarte, usuario, isAuthenticated}) => {


  
//ajustar a pagina scale
useEffect(() => {
  const ajustarEscalaPorLarguraEAltura = () => {
    if (!wrapperRef.current || !containerRef.current) return;

    const wrapperWidth = wrapperRef.current.clientWidth;
    const wrapperHeight = wrapperRef.current.clientHeight;

    const containerWidth = containerRef.current.scrollWidth;
    const containerHeight = containerRef.current.scrollHeight;

    // Calcula as escalas para largura e altura
    const escalaLargura = wrapperWidth / containerWidth;
    const escalaAltura = wrapperHeight / containerHeight;

    // Usa a menor escala para que caiba tanto em largura quanto altura
    const novaEscala = Math.min(escalaLargura, escalaAltura, 1);
    setZoom(novaEscala);
  };

  ajustarEscalaPorLarguraEAltura();
   
  }, [formatoEncarte]);


      
  
  const diferenteGrid = (index, formato) => {

    if(formato == "1080x1350" || formato == "A4"){
       if (paginarprodutos.length === 3 && index === 0) return { gridRow: 'span 2' };
       if (paginarprodutos.length === 5 && index === 0) return { gridColumn: 'span 2' };
       if (paginarprodutos.length === 7 && index === 0) return { gridColumn: 'span 2' };
       if (paginarprodutos.length === 7 && index === 6) return { gridColumn: 'span 2' };
       if (paginarprodutos.length === 8 && index === 0) return { gridColumn: 'span 2' };
       if (paginarprodutos.length === 10 && index === 0) return { gridColumn: 'span 2' };
       if (paginarprodutos.length === 10 && index === 1) return { gridColumn: 'span 2' };
       if (paginarprodutos.length === 11 && index === 0) return { gridColumn: 'span 2' };
       if (paginarprodutos.length === 13 && index === 0) return { gridRow: 'span 2' };
       if (paginarprodutos.length === 13 && index === 1) return { gridColumn: 'span 2' };
       if (paginarprodutos.length === 13 && index === 2) return { gridRow: 'span 2' };
       if (paginarprodutos.length === 14 && index === 0) return { gridColumn: 'span 2' };
       if (paginarprodutos.length === 14 && index === 1) return { gridColumn: 'span 2' };
       if (paginarprodutos.length === 15 && index === 0) return { gridColumn: 'span 2' };
       if (paginarprodutos.length === 17 && index === 0) return { gridRow: 'span 2' };
       if (paginarprodutos.length === 17 && index === 1) return { gridColumn: 'span 2' };
       if (paginarprodutos.length === 17 && index === 2) return { gridColumn: 'span 2' };
       if (paginarprodutos.length === 18 && index === 0) return { gridColumn: 'span 2' };
       if (paginarprodutos.length === 18 && index === 1) return { gridColumn: 'span 2' };
       if (paginarprodutos.length === 19 && index === 0) return { gridColumn: 'span 2' };
       if (paginarprodutos.length === 21 && index === 0) return { gridRow: 'span 2' };
       if (paginarprodutos.length === 21 && index === 1) return { gridRow: 'span 2' };
       if (paginarprodutos.length === 21 && index === 2) return { gridRow: 'span 2' };
       if (paginarprodutos.length === 21 && index === 3) return { gridRow: 'span 2' };
       if (paginarprodutos.length === 22 && index === 0) return { gridRow: 'span 2' };
       if (paginarprodutos.length === 22 && index === 1) return { gridRow: 'span 2' };
       if (paginarprodutos.length === 22 && index === 2) return { gridRow: 'span 2' };
       if (paginarprodutos.length === 23 && index === 0) return { gridRow: 'span 2' };
       if (paginarprodutos.length === 23 && index === 1) return { gridRow: 'span 2' };
       if (paginarprodutos.length === 24 && index === 0) return { gridRow: 'span 2' };
       if (paginarprodutos.length === 26 && index === 0) return { gridRow: 'span 2' };
       if (paginarprodutos.length === 26 && index === 1) return { gridRow: 'span 2' };
       if (paginarprodutos.length === 26 && index === 2) return { gridRow: 'span 2' };
       if (paginarprodutos.length === 26 && index === 3) return { gridRow: 'span 2' };
       if (paginarprodutos.length === 27 && index === 1) return { gridRow: 'span 2' };
       if (paginarprodutos.length === 27 && index === 2) return { gridRow: 'span 2' };
       if (paginarprodutos.length === 27 && index === 3) return { gridRow: 'span 2' };
       if (paginarprodutos.length === 28 && index === 0) return { gridRow: 'span 2' };
       if (paginarprodutos.length === 28 && index === 1) return { gridRow: 'span 2' };
       if (paginarprodutos.length === 29 && index === 0) return { gridRow: 'span 2' };


}

if(formato == "1080x1920"  || formato == "A4vertical"){

  if (paginarprodutos.length === 3 && index === 0) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 5 && index === 0) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 7 && index === 0) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 7 && index === 6) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 8 && index === 0) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 10 && index === 0) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 10 && index === 1) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 11 && index === 0) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 13 && index === 0) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 13 && index === 1) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 13 && index === 2) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 14 && index === 0) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 14 && index === 1) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 15 && index === 0) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 17 && index === 0) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 17 && index === 1) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 17 && index === 2) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 18 && index === 0) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 18 && index === 1) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 19 && index === 0) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 21 && index === 0) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 21 && index === 1) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 21 && index === 2) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 22 && index === 0) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 22 && index === 1) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 23 && index === 0) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 25 && index === 0) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 25 && index === 1) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 25 && index === 2) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 26 && index === 0) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 26 && index === 1) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 27 && index === 0) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 29 && index === 0) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 29 && index === 1) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 29 && index === 2) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 30 && index === 0) return { gridColumn: 'span 2' };
  if (paginarprodutos.length === 30 && index === 1) return { gridColumn: 'span 2' };


}
  }

      const obterTamanhoFonte = () => {
        const qtdProdutos = paginarprodutos.length;
        let width = 250; // valor padrão
      
        if (qtdProdutos === 1) width = 400;
        else if (qtdProdutos === 2) width = 350;
        else if (qtdProdutos <= 4) width = 280;
        else if (qtdProdutos <= 5) width = 220;
        else if (qtdProdutos <= 7) width = 160;
        else if (qtdProdutos <= 8) width = 160;
        else if (qtdProdutos <= 14) width = 130;
        else if (qtdProdutos <= 20) width = 100;
        else if (qtdProdutos <= 25) width = 90;
        else if (qtdProdutos <= 30) width = 80;

      
        // Fórmula proporcional:
        // suponha que para width 400, fontSize seja 100
        const fontSize = (width / 400) * 100; 
        const fontTitulo = fontSize * 0.6; // ou outro fator, para título ser menor
        const height = width / 2; // se quiser manter proporção, ajusta aqui também
      
        return { fontTitulo, fontSize, width, height };
      };



        const ajustarGrid = (totalProdutos) => {
        let formato = formatoEncarte;
        let maxColunas = 4; // valor padrão
      
        // Define o máximo de colunas conforme o formato
        if (formato === '1080x1350') {
          maxColunas = 5;
        } else if (formato === '1080x1920') {
          maxColunas = 4;
        }
        else if (formato === 'A4') {
          maxColunas = 5;
        }
        else if (formato === 'A4vertical') {
          maxColunas = 4;
        }
      
        // Calcula o número ideal de colunas baseado na raiz quadrada
        let colunas = Math.ceil(Math.sqrt(totalProdutos));
        
        // Limita pelas colunas máximas permitidas
        colunas = Math.min(colunas, maxColunas);
      
        // Calcula as linhas necessárias
        let linhas = Math.ceil(totalProdutos / colunas);


         // Regra específica para 2 produtos no formato 1080x1920
         if (formato === '1080x1920' && totalProdutos === 2) {
          colunas = 1 ; linhas = 2;
        }

        return {
          display: 'grid',
          gridTemplateColumns: `repeat(${colunas}, 1fr)`,
          gridTemplateRows: `repeat(${linhas}, 1fr)`,
          gap: '13px',
        };
      };

        function getTextColor(backgroundColor) {
        // Converte a cor de nome (ex: "white") ou hex para RGB
        const tempDiv = document.createElement('div');
        tempDiv.style.color = backgroundColor;
        document.body.appendChild(tempDiv);
      
        const computedColor = getComputedStyle(tempDiv).color;
        document.body.removeChild(tempDiv);
      
        const rgb = computedColor.match(/\d+/g).map(Number); // [r, g, b]
      
        // Fórmula de luminância relativa (W3C)
        const [r, g, b] = rgb.map(c => {
          const channel = c / 255;
          return channel <= 0.03928
            ? channel / 12.92
            : Math.pow((channel + 0.055) / 1.055, 2.4);
        });
      
        const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      
        // Se a luminância for alta, o fundo é claro → texto escuro. Caso contrário, texto branco.
        return luminance > 0.5 ? '#000000' : '#ffffff';
      }


      
    // Função para editar um produto
    const editarProduto = (produto) => {
      setProdutoEditando(produto); // Preenche o formulário de edição com os dados do produto
      setVisivel('editar');
      
    };

 useEffect(() => {
  if (!paginarprodutos || paginarprodutos.length === 0) return;

  const nova = paginarprodutos.map((produto, index) => {
    const estilo = diferenteGrid(index, formatoEncarte) || {};
    const isLarge =
      estilo.gridColumn === 'span 2' || estilo.gridRow === 'span 2';

    // Agora: se NÃO for span 2 → destaque = 0
    const destaque = isLarge ? 1 : 0;

    return { ...produto, destaque };
  });

  // Evita loop verificando se algo mudou
  const mudou = nova.some((p, i) => {
    const original = paginarprodutos[i];
    return String(p.destaque) !== String(original?.destaque);
  });

  if (mudou) {
    setEncarte(() => nova);
  }
}, [paginarprodutos, formatoEncarte, setEncarte]);



return(
 

<div id="encarte-container" 
ref={containerRef}
style={{ ...estiloencarte, transform: `translate(-50%, 0%) scale(${zoom})`, backgroundImage: `url(${templateAtivo.planoFundo})`}}>


          {(watermark) && (
              <img src={WaterMark} className="watermark"/>
           )}

           
          
            {(paginarprodutos.length < 1 && templateAtivo.planoFundo) &&(
            <div onClick={() => setVisivel('produtos')} className="mensagemInicio"><i class="fa-solid fa-plus fa-beat"></i><br/>Adicione os produtos</div>
            )}


            {dadosencarte.imagemilustrativa == 1 &&(<span className="imagemilustrativa">Imagem meramente ilustrativa</span>)}

            
            <div className="topoEncarte">

              {(usuario?.plano === "free" || !isAuthenticated) && (
                <span className="feitocom">Feito com <strong>enkartes.com</strong></span>
              )}


                {dadosencarte.logo && (<AjusteLogo 
                logo={dadosencarte.logo} 
                dadosencarte={dadosencarte}
                setDadosEncarte={setDadosEncarte}
                />)}
                
            </div>
            
            
            <div id="produtos" style={ajustarGrid(paginarprodutos.length)}>
              {paginarprodutos.map((produto, index) => {
                return (
                  <div key={index} className="produto-item" style={{ ...diferenteGrid(index, formatoEncarte), 
                    backgroundColor: produto.destaque === 0 ? templateAtivo.corFundo : templateAtivo.corDestaque }}>
                    

                    <div className="produto-info">
                      <h3 className="produtoNome" style={{ color: getTextColor(produto.destaque === 0? templateAtivo.corFundo : templateAtivo.corDestaque), fontSize: `${obterTamanhoFonte().fontTitulo}px` }}>{produto.titulo}</h3>
                    </div>

                    
                    
                    {produto.imagemCarregando ? (<div className="imagem-container" style={{ backgroundImage: `url(${loading})` }}></div>):
                    (<div className="imagem-container" style={{ backgroundImage: `url(${produto.imagem})` }}></div>)}


                    <div className="precos">
                    <Precos 

                    produto = {produto}
                    colorFont={getTextColor(templateAtivo.corEtiqueta)}
                    templateAtivo={templateAtivo}
                    fontSize={obterTamanhoFonte()}
                    />
                    </div>

                    <div className="acao">
                      <button onClick={() => editarProduto(produto)}><i class="fa-solid fa-pen-to-square"></i> Editar</button>
                    </div>
                    
                  </div>
                );
              })}
            </div>


            {(dadosencarte.instagram || dadosencarte.telefone || dadosencarte.whatsapp || dadosencarte.datainicial || dadosencarte.datafinal) && (
            <div className="rodapeEncarte">

             

             
              <div className="contatos" style={{ color: getTextColor(templateAtivo.corRodape), backgroundColor: templateAtivo.corRodape}}>
                {dadosencarte.instagram && (<span><i className="fa-brands fa-instagram"></i> {dadosencarte.instagram}</span>)}
                {dadosencarte.telefone && (<span><i className="fa-solid fa-phone"></i> {dadosencarte.telefone}</span>)}
                {dadosencarte.whatsapp && (<span><i className="fa-brands fa-whatsapp"></i> {dadosencarte.whatsapp}</span>)}
                {dadosencarte.endereco && (<span><i class="fa-solid fa-location-dot"></i> {dadosencarte.endereco}</span>)}
              
              </div>

               <div className="cartoes text-center pb-1 pt-1">
                {dadosencarte.cartoes && dadosencarte.cartoes.length > 0 && (
                  dadosencarte.cartoes.map(c => (
                    <img 
                      key={c.id}
                      src={c.imagem}
                      alt={c.nome}
                      style={{ width: "77px", marginRight: "8px" }}
                    />
                  ))
                )}
              </div>


               {dadosencarte.datainicial && dadosencarte.datafinal &&(
              <div className="validade">Ofertas válidas do dia {dadosencarte.datainicial} até {dadosencarte.datafinal}  {dadosencarte.estoque == 1 &&(<span>ou enquanto durarem os estoques</span>)}</div>
              )}

            </div>)}

  </div>
)
}
export default EditorEncarte
