const Precos = ({produto, colorFont, templateAtivo, fontSize}) => {

    return(
<div >
        {produto.tipopreco === 'simples' && (
                    <div className="precosimples" style={{color: colorFont, width: `${fontSize.width}px`,  height: `${fontSize.height}px`, fontSize: `${fontSize.fontSize}px`, backgroundColor: templateAtivo.corEtiqueta }}>
                        <span className="unidade">{produto.unidade}</span>
                        <span className="cifra">R$ </span> <span className="reais">{produto.preco.split(',')[0]}</span>,<span className="centavos">{produto.preco.split(',')[1]}</span>
                    </div>
                     )}


                  {produto.tipopreco === 'dexpory' && (
                    <div className="precosimples" style={{ color: colorFont, width: `${fontSize.width}px`,  height: `${fontSize.height}px`, fontSize: `${fontSize.fontSize}px`, backgroundColor: templateAtivo.corEtiqueta }}>
                        <span className="unidade">{produto.unidade}</span>
                        
                        <span className="precotitulo">DE  <strong>R$ {produto.precode}</strong> POR</span>
                        <span className="cifra">R$ </span> <span className="reais">{produto.precopor.split(',')[0]}</span>,<span className="centavos">{produto.precopor.split(',')[1]}</span>
                   
                    </div>
                     )}


                    {produto.tipopreco === 'levexpaguey' && (
                    <div className="precosimples" style={{ color: colorFont, width: `${fontSize.width}px`,  height: `${fontSize.height}px`, fontSize: `${fontSize.fontSize}px`, backgroundColor: templateAtivo.corEtiqueta }}>
                        
                        <span className="unidade">{produto.unidade}</span>
                        <span className="precotitulo"><strong>{produto.titulodesconto}</strong></span>

                        <span className="cifra">R$ </span> <span className="reais">{produto.precodesconto.split(',')[0]}</span>,<span className="centavos">{produto.precodesconto.split(',')[1]}</span>
                    </div>
                     )}




                {produto.tipopreco === 'parcelado' && (
                    <div className="precosimples" style={{ color: colorFont, width: `${fontSize.width}px`,  height: `${fontSize.height}px`, fontSize: `${fontSize.fontSize}px`, backgroundColor: templateAtivo.corEtiqueta }}>
                        <span className="unidade">{produto.unidade}</span>               
                        
                        <span className="precotitulo"><strong>{produto.tituloprecoparcelado}</strong></span>
                       

                        <span className="precotitulo2">{produto.titulopreconormal} <strong>R$ {produto.precoavista}</strong></span>

                        <span className="cifra">R$ </span> <span className="reais">{produto.precoparcelado.split(',')[0]}</span>,<span className="centavos">{produto.precoparcelado.split(',')[1]}</span>
                    </div>
                     )}


                  {produto.tipopreco === 'customizado' && (
                    <div className="precosimples" style={{ color: colorFont, width: `${fontSize.width}px`,  height: `${fontSize.height}px`, fontSize: `${fontSize.fontSize}px`, backgroundColor: templateAtivo.corEtiqueta }}>
                       <span className="customizado">{produto.precocustomizado}</span>
                    </div>
                     )}  

                    </div>)
}
export default Precos;
