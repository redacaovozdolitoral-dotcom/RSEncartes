import React, { useState, useEffect, useRef } from 'react';
import { NumericFormat } from 'react-number-format';
import InputMoeda from '../CurrencyInput.js';
import RemoverFundo from './removerFundo.js';


function EditarProduto({produtoEditando, setVisivel, setLoading,  setCampoProduto, idEncarte, isAuthenticated}) {

   const [selectedOption, setSelectedOption] = useState(produtoEditando.tipopreco);
   const [imagens, setImagens] = useState([]);
   const [loadingimagens, setLoadingImagens] = useState(false);
   const [inputbuscar, setInputBuscar] = useState();
   
   const fileInputRef = useRef(null);

   
const [imagemParaProcessar, setImagemParaProcessar] = useState(null);

   const [showModal, setShowModal] = useState(false);
   const [loadingIA, setLoadingIA] = useState(false);
   const [previewIA, setPreviewIA] = useState(null);
   const [loadingUpload, setLoadingUpload] = useState(false);


console.log(produtoEditando)

   const salvarCampo = async (campo, valor) => {
        
    if (!isAuthenticated) return; // Evita busca prematura
    
    // Função para salvar a edição do produto no banco de dados

    const formData = new FormData();
    formData.append('id', produtoEditando.id);
    formData.append('campo', campo);
    formData.append('valor', valor);

    try {
      await fetch('https://enkartes.com/api/editarItemEncarte.php', {
        method: 'POST',
        body: formData
      });
      console.log(`Campo ${campo} salvo com sucesso`);
    } catch (error) {
      console.error(`Erro ao salvar ${campo}:`, error);
    }
  };



  
  const trocarImagem = async (termo) => {

    setLoadingImagens(true)

    try {
      const res = await fetch(`https://enkartes.com/api/buscarImagemProduto.php?termo=${encodeURIComponent(termo)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setImagens(data);
        setLoadingImagens(false)
      } else {
        setImagens([]);
        alert(data.erro || 'Erro ao buscar imagens.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro na requisição');
    } finally {
    }
  }


  const selectImagem =  (url) => {
    
       setLoading(true)     
    // Função para salvar a edição do produto no banco de dados

        setCampoProduto(produtoEditando.id, 'imagem', url);
        salvarCampo('imagem', url);
        setVisivel('produtos');
        setLoading(false)     

        

    
  };


const EnviarImagem = () => {
  fileInputRef.current.click(); // abre o seletor de arquivo
};

const handleArquivoSelecionado = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  setImagemParaProcessar(file);
  setShowModal(true); // Abre modal para perguntar se quer remover fundo
};




const processarImagem = async (removerFundo = false) => {
  if (!imagemParaProcessar) return;

  try {
    const formData = new FormData();
    formData.append("imagem", imagemParaProcessar);

    if (removerFundo) {
      setLoadingIA(true);        // IA
    } else {
      setLoadingUpload(true);    // Upload normal
    }

    const endpoint = removerFundo
      ? 'https://enkartes.com/api/removebg.php'
      : 'https://enkartes.com/api/uploadImagem.php';

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error("Erro ao processar imagem");

    const data = await response.json();

    if (data?.url) {
      if (removerFundo) {
        setPreviewIA(data.url);
      } else {
        setCampoProduto(produtoEditando.id, 'imagem', data.url);
        await salvarCampo('imagem', data.url);

        setShowModal(false);
        setVisivel('produtos');
      }
    } else {
      alert(data.error || 'Erro ao processar imagem.');
    }

  } catch (error) {
    console.error(error);
    alert('Erro ao processar imagem.');
  } finally {
    setLoadingIA(false);
    setLoadingUpload(false);
    setImagemParaProcessar(null);
  }
};



const confirmarUsoImagemIA = async () => {
  if (!previewIA) return;

  setLoading(true);

  await salvarCampo('imagem', previewIA);
  setCampoProduto(produtoEditando.id, 'imagem', previewIA);

  setPreviewIA(null);
  setImagemParaProcessar(null);
  setShowModal(false);
  setLoading(false);
  setVisivel('produtos');
};





    return(
        <>
        <div className="mt-3 updateImagem">


        <div className="d-flex gap-2 mb-3">
            <button className="botao2" onClick={() => trocarImagem(produtoEditando?.titulo)}><i class="fa-solid fa-images"></i> Trocar Imagem</button>
            <button className="botao" onClick={() => EnviarImagem()}><i class="fa-solid fa-upload"></i> Enviar imagem</button>
          </div>


          <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleArquivoSelecionado}
          style={{ display: 'none' }}
        />


          <div className="mb-3">
          <img src={produtoEditando?.imagem}/>
          </div>



          


         {imagens != '' && (
  <form
    onSubmit={(e) => {
      e.preventDefault(); // Impede recarregamento da página
      trocarImagem(inputbuscar); // Chama a função de busca
    }}
  >
   <div className="d-flex gap-1">

       <input type="text" placeholder="Digite o nome do produto"
        onChange={(e) => setInputBuscar(e.target.value)}
        className="form-control"/>

 <button type="submit" className="btn btn-principal"><i class="fa-solid fa-magnifying-glass"></i></button>
   </div>    
  </form>
)}



          {!loadingimagens ? (

            <div>
            
            <div className="listar-imagens">
            {imagens.map((img, i) => (
              <img key={i} src={img.imagem} 
              onClick={() => selectImagem(img.imagem)
              }    
              alt="Resultado" />
            ))}
          </div>
      
        
          </div>) :
          (<span className="small"><i className="fa-solid fa-circle-notch fa-spin"></i> Carregando imagens...</span>)}


        </div>


                        <label>Nome do produto</label>
                        <input type="text" className="form-control mb-3" id="nomeProduto" 
                        defaultValue={produtoEditando?.titulo} 
                        onChange={(e) => {
                            setCampoProduto(produtoEditando.id, 'titulo', e.target.value);
                            salvarCampo('titulo', e.target.value);
                          }}
                          />

                        
                        <label>Unidade</label>
                        <select className="form-control mb-3"  
                        defaultValue={produtoEditando?.unidade}
                        onChange={(e) => {
                            setCampoProduto(produtoEditando.id, 'unidade', e.target.value);
                            salvarCampo('unidade', e.target.value);
                          }}>
                        
                        <option value="unidade">Unidade</option>
                        <option value="kg">Quilo (kg)</option>
                        <option value="cada">Grama (g)</option>
                        <option value="l">Litro (l)</option>
                        <option value="ml">Mililitro (ml)</option>
                        <option value="caixa">Caixa</option>
                        <option value="pacote">Pacote</option>
                        <option value="bandeja">Bandeja</option>
                        <option value="duzia">Duzia</option>
        
                        </select>


                        <label>Tipo de preço</label>
                        <select  className="form-control mb-3"  
                        defaultValue={produtoEditando?.tipopreco}
                        onChange={(e) => {
                            salvarCampo('tipopreco', e.target.value);
                            setCampoProduto(produtoEditando.id, 'tipopreco', e.target.value);
                            setSelectedOption(e.target.value);
                          }}>
                        <option value="simples">Simples</option>
                        <option value="dexpory">De X Por Y</option>
                        <option value="levexpaguey">Leve X Pague Y</option>
                        <option value="parcelado">Parcelado</option>
                        <option value="customizado">Customizado</option>
                        </select>


                      {selectedOption === "simples" && (
                        <div>
                        <label>Preço</label>
                        <InputMoeda
                          className="form-control mb-3"
                          initialValue={produtoEditando?.preco || '0,00'}
                          onChange={(values) => {
                            // Atualiza o campo com a string formatada, ex: "9,00"
                           setCampoProduto(produtoEditando.id, 'preco', values || '0,00');
                           salvarCampo('preco', values || '0,00');
                          }}
                        /></div>)}


                        {selectedOption === "dexpory" && (
                        <div className="dexpory row">

                            <div className="col-6">
                            <label>De</label>
                            <InputMoeda
                          className="form-control mb-3"
                          initialValue={produtoEditando?.precode || '0,00'}
                          onChange={(values) => {
                            // Atualiza o campo com a string formatada, ex: "9,00"
                            setCampoProduto(produtoEditando.id, 'precode', values || '0,00');
                            salvarCampo('precode', values || '0,00');
                          }}
                        />
                            </div>

                            <div className="col-6">
                            <label>Por</label>
                            <InputMoeda
                          className="form-control mb-3"
                          initialValue={produtoEditando?.precopor || '0,00'}
                          onChange={(values) => {
                            // Atualiza o campo com a string formatada, ex: "9,00"
                            setCampoProduto(produtoEditando.id, 'precopor', values || '0,00');
                            salvarCampo('precopor', values || '0,00');
                          }}
                        />
                            </div>

                        </div>
                        )}



                        {selectedOption === "levexpaguey" && (
                        <div className="dexpory row">

                            <div className="col-8">
                            <label>Titulo desconto</label>
                            <input type="text" className="form-control " defaultValue={produtoEditando?.titulodesconto} 
                             onChange={(e) => {
                                 setCampoProduto(produtoEditando.id, 'titulodesconto', e.target.value);
                                 salvarCampo('titulodesconto', e.target.value);
                               }}/>
                            </div>

                            <div className="col-4">
                            <label>Por</label>
                            <InputMoeda
                          className="form-control mb-3"
                          initialValue={produtoEditando?.precodesconto || '0,00'}
                          onChange={(values) => {
                            // Atualiza o campo com a string formatada, ex: "9,00"
                            setCampoProduto(produtoEditando.id, 'precodesconto', values || '0,00');
                            salvarCampo('precodesconto', values || '0,00');
                          }}
                        />
                            </div>

                        </div>
                        )}

                    {selectedOption === "parcelado" && (
                        <div className="dexpory">

                            <div className="row">

                            <div className="col-7">
                            <label>Titulo preço normal</label>
                            <input type="text" className="form-control " defaultValue={produtoEditando?.titulopreconormal} 
                             onChange={(e) => {
                                 setCampoProduto(produtoEditando.id, 'titulopreconormal', e.target.value);
                                 salvarCampo('titulopreconormal', e.target.value);
                               }}/>
                            </div>

                            <div className="col-5">
                            <label>Preço normal</label>
                            <InputMoeda
                          className="form-control mb-3"
                          initialValue={produtoEditando?.precoavista || '0,00'}
                          onChange={(values) => {
                            // Atualiza o campo com a string formatada, ex: "9,00"
                            setCampoProduto(produtoEditando.id, 'precoavista', values || '0,00');
                            salvarCampo('precoavista', values || '0,00');
                          }}
                        />
                            </div>

                            </div>

                            <div className="row">
                                
                            <div className="col-7">
                            <label>Titulo preço parcelado</label>
                            <input type="text" className="form-control " defaultValue={produtoEditando?.tituloprecoparcelado} 
                            onChange={(e) => {
                                 setCampoProduto(produtoEditando.id, 'tituloprecoparcelado', e.target.value);
                                 salvarCampo('tituloprecoparcelado', e.target.value);
                               }}/>
                            </div>
    
                            <div className="col-5">
                            <label>Preço parcelado</label>
                            <InputMoeda
                          className="form-control mb-3"
                          initialValue={produtoEditando?.precoparcelado || '0,00'}
                          onChange={(values) => {
                            // Atualiza o campo com a string formatada, ex: "9,00"
                            setCampoProduto(produtoEditando.id, 'precoparcelado', values || '0,00');
                            salvarCampo('precoparcelado', values || '0,00');
                          }}
                        />
                            </div>
    
                             </div>

                        </div>
                        )}  

                    {selectedOption === "customizado" && (
                        <div className="dexpory">

                            <label>Customizado</label>
                            <input type="text" className="form-control " defaultValue={produtoEditando?.precocustomizado} 
                            onChange={(e) => {
                                setCampoProduto(produtoEditando.id, 'precocustomizado', e.target.value);
                                 salvarCampo('precocustomizado', e.target.value);
                               }}/>
                           
                        </div>
                        )}      

<RemoverFundo
  loadingIA={loadingIA}
  loadingUpload={loadingUpload}
  showModal={showModal}
  setShowModal={setShowModal}
  processarImagem={processarImagem}
  previewIA={previewIA}
  confirmarUsoImagemIA={confirmarUsoImagemIA}
  setPreviewIA={setPreviewIA}
/>
                        </> )
}
export default EditarProduto;
