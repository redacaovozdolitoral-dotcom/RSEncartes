import React, { useRef, useEffect} from 'react';

import WaterMark from '../imagens/watermark.png';
import AjusteLogo from './ajustelogo.js';


const EditorCartazHorizontal = ({wrapperRef, containerRef, setZoom, usuario, setProdutoEditando, setVisivel, formatoEncarte, dadosencarte, zoom, templateAtivo, estiloencarte, watermark, paginarprodutos, setDadosEncarte}) => {


      

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


    // Função para editar um produto
    const editarProduto = (produto) => {
       if (!produto.id) {
       produto.id = crypto.randomUUID();  // Gera um ID aleatório curto
       }
      setProdutoEditando(produto); // Preenche o formulário de edição com os dados do produto
      setVisivel('editar');
      
    };


return(
<div id="encarte-container"
 ref={containerRef}
className="cartazhorizontal" style={{...estiloencarte, transform: `translate(-50%, 0%) scale(${zoom})`}}>


          {(!usuario || usuario.plano == 'free') && (
              <img src={WaterMark} className="watermark"/>
           )}
           

           
          
            {(paginarprodutos.length < 1) &&(
            <span className="mensagemInicio">Adicione os produtos</span>
            )}


           
               {dadosencarte.logo && (<div className="position-absolute"><AjusteLogo 
                logo={dadosencarte.logo} 
                dadosencarte={dadosencarte}
                setDadosEncarte={setDadosEncarte}
                /></div>)}
            


            
            <div className="topo-cartaz">

              <h2>Oferta</h2>
                
            </div>


         
            
            <div className="produtos">
              {paginarprodutos.map((produto, index) => {
                return (
                  <div key={index} className="produto-item">
                    

                   
                  
       <div className="d-flex align-items-center gap-2">


                    <h3 className="nome-produto mb-0 w-50">
                    {produto.titulo}
                </h3>

                    {produto.tipopreco === 'simples' && (


                     <div className="text-center">

                      
                         <div className="preco">
                          <span className="cifra">R$ </span> <span className="reais">{produto.preco.split(',')[0]}</span>
                          <span className="centavos">,{produto.preco.split(',')[1]} <span className="unidade">{produto.unidade}</span></span>
                          
                          </div>

                        </div>
                    
                     )}

   

                  {produto.tipopreco === 'dexpory' && (

              
                  <div className={`text-center ` + (formatoEncarte === 'cartazhorizontal' ? 'd-flex justify-content-center' : '')}>

                          <span className="ptitulo">De <strong>R$ {produto.precode}</strong> por</span>
                      
                         <div className="preco">
                          <span className="cifra">R$ </span> <span className="reais">{produto.precopor.split(',')[0]}</span>
                          <span className="centavos">,{produto.precopor.split(',')[1]} <span className="unidade">{produto.unidade}</span></span>
      
                          </div>

                        </div>
        
                     )}




                    {produto.tipopreco === 'levexpaguey' && (



                     <div className={`text-center ` + (formatoEncarte === 'cartazhorizontal' ? 'd-flex justify-content-center' : '')}>

                          <span className="ptitulo">{produto.titulodesconto}</span>
                      
                         <div className="preco">
                          <span className="cifra">R$ </span> <span className="reais">{produto.precodesconto.split(',')[0]}</span>
                          <span className="centavos">,{produto.precodesconto.split(',')[1]} <span className="unidade">{produto.unidade}</span></span>
                          
                          </div>

                        </div>
          
                     )}




                {produto.tipopreco === 'parcelado' && (


                    <div className={`text-center ` + (formatoEncarte === 'cartazhorizontal' ? 'd-flex justify-content-center' : '')}>

                          <span className="ptitulo">{produto.tituloprecoparcelado}</span>

                      
                      <div>
                          <div className="preco">
                          <span className="cifra">R$ </span> <span className="reais">{produto.precoparcelado.split(',')[0]}</span>
                          <span className="centavos">,{produto.precoparcelado.split(',')[1]} <span className="unidade">{produto.unidade}</span></span>
                         
                        
                         </div>

                          <span className="ptitulo2">{produto.titulopreconormal} R$ {produto.precoavista}</span>

                         </div>
                         
                         </div>

                    
                     )}


                  {produto.tipopreco === 'customizado' && (
                    <div className="precosimples" >
                       <span className="customizado">{produto.precocustomizado}</span>
                    </div>
                     )}   

          

                    <div className="acao">
                      <button onClick={() => editarProduto(produto)}>Editar</button>
                    </div>
                  </div>
                    
                  </div>
                );
              })}
            </div>


          </div>
)
}
export default EditorCartazHorizontal
