import React, { useEffect, useState } from 'react';
import RemoverFundo from './removerFundo.js';



function Personalizar({ dadosEncarte, setDadosEncarte, setTemplateAtivo, dadosTemplateAtivo}) {

const [visivel, setVisivel] = useState('informacoes');
const isAuthenticated = localStorage.getItem('user');
const [idEncarte, setIdEncarte] = useState();
const [uploading, setUploading] = useState(false);
const [mensagem, setMensagem] = useState('');

const [selecionados, setSelecionados] = useState([]);
const [status, setStatus] = useState("");


const [imagemParaProcessar, setImagemParaProcessar] = useState(null);
const [showModal, setShowModal] = useState(false);
const [loadingIA, setLoadingIA] = useState(false);
const [previewIA, setPreviewIA] = useState(null);
const [loadingUpload, setLoadingUpload] = useState(false);


const [bordalogo, setBordaAtiva] = useState(''); // valor inicial pode ser 'black', '' ou 'white'

useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const encarteId = urlParams.get('id');
        setIdEncarte(encarteId);
      }, []);


     

       useEffect(() => {
          
            if (!idEncarte) return;
          
          //Obter dados do personalzar
            fetch(`https://enkartes.com/api/obterTemplateEncarte.php?id=${idEncarte}`)
            .then(response => response.json())
            .then(data => {

              setDadosEncarte(prev => ({
                ...prev, 
                'datainicial': data.data_inicial,
                'datafinal': data.data_final,
                'telefone': data.telefone,
                'whatsapp': data.whatsapp,
                'endereco': data.endereco,
                'instagram': data.instagram,
                'bordalogo': data.bordalogo,
                'estoque': data.estoque,
                'imagemilustrativa': data.imagemilustrativa,
                'imagemilustrativa': data.imagemilustrativa,



              }));


              if (data.cartoes) {
        try {
          const selecionadosBanco = JSON.parse(data.cartoes);

          // Atualiza o state de cartões selecionados
          setSelecionados(selecionadosBanco);

          // Atualiza o encarte também
          setDadosEncarte(prev => ({
            ...prev,
            cartoes: selecionadosBanco
          }));
        } catch (e) {
          console.error("Erro ao decodificar cartões:", e);
        }
      }



            })
            .catch(error => console.error('Erro ao carregar dados:', error));
            }, [idEncarte]);


function formatarData(dataISO) {
    if (!dataISO) return '';
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  function desformatarData(dataFormatada) {
    if (!dataFormatada) return '';
    const [dia, mes, ano] = dataFormatada.split('/');
    return `${ano}-${mes}-${dia}`;
  }


  const salvarCampo = async (campo, valor) => {

    if (!isAuthenticated) return;

    const formData = new FormData();
    formData.append('id_encarte', idEncarte);
    formData.append('campo', campo);
    formData.append('valor', valor);

    try {
      await fetch('https://enkartes.com/api/salvarPersonalizar.php', {
        method: 'POST',
        body: formData
      });
      console.log(`Campo ${campo} salvo com sucesso`);
    } catch (error) {
      console.error(`Erro ao salvar ${campo}:`, error);
    }
  };




  const enviarLogo = async (file) => {

    if (!isAuthenticated){
      const reader = new FileReader();
      reader.onloadend = () => {
        setDadosEncarte(prev => ({ ...prev, 'logo': reader.result }));
      };
      reader.readAsDataURL(file);
    }else{

    setUploading(true);
    setMensagem('Aguarde, enviando...');

    const formData = new FormData();
    formData.append('logo', file);
    formData.append('id_encarte', idEncarte);


    try {
      const response = await fetch('https://enkartes.com/api/enviarLogo.php', {
        method: 'POST',
        body: formData
      });

      const res = await response.json();
      if (res.url) {
        setDadosEncarte(prev => ({...prev, 'logo': res.url, 'logo_width': res.logo_width}));
        setMensagem('Logo enviada com sucesso!');
      } else {
        setMensagem('Erro ao enviar a logo.');
        console.error(res.error);
      }
    } catch (error) {
      setMensagem('Erro na conexão com o servidor.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  }
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
        // 👇 só preview (IGUAL)
        setPreviewIA(data.url);
      } else {
        // 👇 aqui muda: envia logo normal
        await enviarLogo(imagemParaProcessar);
        setShowModal(false);
      }
    } else {
      alert(data.error || 'Erro ao processar imagem.');
    }

  } catch (error) {
    console.error(error);
    alert('Erro ao processar imagem.');
  } finally {
    setLoadingIA(false);
  }
};


const confirmarUsoImagemIA = async () => {
  if (!previewIA) return;

  setUploading(true);

  // cria um "arquivo fake" a partir da URL retornada
  const response = await fetch(previewIA);
  const blob = await response.blob();
  const file = new File([blob], "logo.png", { type: blob.type });

  await enviarLogo(file);

  setPreviewIA(null);
  setImagemParaProcessar(null);
  setShowModal(false);
  setUploading(false);
};


const toggleCartao = (cartaoObj) => {
  setSelecionados(prev => {
    const existe = prev.find(c => c.id === cartaoObj.id);
    let novo;

    if (existe) {
      novo = prev.filter(c => c.id !== cartaoObj.id);
    } else {
      novo = [...prev, cartaoObj]; // adiciona objeto inteiro
    }

    // Atualiza o encarte
    setDadosEncarte(enc => ({
      ...enc,
      cartoes: novo
    }));

    // Salva no banco
    salvarCampo("cartoes", JSON.stringify(novo));

    return novo;
  });
};




  const cartao = [
  { id: 1, nome: "Visa", imagem: "https://d1038wlozf3qar.cloudfront.net/cartoes/visa.png" },
  { id: 2, nome: "Mastercard", imagem: "https://d1038wlozf3qar.cloudfront.net/cartoes/master.png" },
  { id: 3, nome: "Elo", imagem: "https://d1038wlozf3qar.cloudfront.net/cartoes/elo.png" },
  { id: 4, nome: "Hipercard", imagem: "https://d1038wlozf3qar.cloudfront.net/cartoes/hipercard.png" },
  { id: 5, nome: "American Express", imagem: "https://d1038wlozf3qar.cloudfront.net/cartoes/american_express.png" },
  { id: 6, nome: "Pix", imagem: "https://d1038wlozf3qar.cloudfront.net/cartoes/pix.png" },
  { id: 7, nome: "Boleto", imagem: "https://d1038wlozf3qar.cloudfront.net/cartoes/boleto.png" },
  { id: 8, nome: "Dinheiro", imagem: "https://d1038wlozf3qar.cloudfront.net/cartoes/dinheiro.png" },
  { id: 9, nome: "Cielo", imagem: "https://d1038wlozf3qar.cloudfront.net/cartoes/cielo.png" },
  { id: 10, nome: "Hiper", imagem: "https://d1038wlozf3qar.cloudfront.net/cartoes/hiper.png" },
  { id: 11, nome: "Sodexo", imagem: "https://d1038wlozf3qar.cloudfront.net/cartoes/sodexo.png" },
  { id: 12, nome: "Ticket", imagem: "https://d1038wlozf3qar.cloudfront.net/cartoes/ticket.png" },
  { id: 13, nome: "Auxilio Brasil", imagem: "https://d1038wlozf3qar.cloudfront.net/cartoes/auxilio_brasil.png" },
  { id: 14, nome: "SitPass", imagem: "https://d1038wlozf3qar.cloudfront.net/cartoes/sitpass.png" },
  { id: 15, nome: "Vr Alimentacao", imagem: "https://d1038wlozf3qar.cloudfront.net/cartoes/vr_alimentacao.png" },
  { id: 16, nome: "Vr Refeição", imagem: "https://d1038wlozf3qar.cloudfront.net/cartoes/vr_refeicao.png" },
  { id: 17, nome: "Banese", imagem: "https://d1038wlozf3qar.cloudfront.net/cartoes/banese.png" },
  { id: 18, nome: "Mães de Goias", imagem: "https://d1038wlozf3qar.cloudfront.net/cartoes/maes_de_goias.png" },
  { id: 19, nome: "Alelo", imagem: "https://d1038wlozf3qar.cloudfront.net/cartoes/alelo.png" },
  { id: 20, nome: "Banese", imagem: "https://d1038wlozf3qar.cloudfront.net/cartoes/banese.png" },








];



    
    return(<>
       
        
<div className="grupoBotoes">
  <button type="button" className={`botao ${visivel === 'informacoes' ? 'ativo' : ''}`} onClick={() => setVisivel('informacoes')}>Informações</button>
  <button type="button" className={`botao ${visivel === 'contatos' ? 'ativo' : ''}`} onClick={() => setVisivel('contatos')}>Contatos</button>
  <button type="button" className={`botao ${visivel === 'logo' ? 'ativo' : ''}`} onClick={() => setVisivel('logo')}>Logo</button>
  <button type="button" className={`botao ${visivel === 'cartoes' ? 'ativo' : ''}`} onClick={() => setVisivel('cartoes')}>Meios de Pagamento</button>

</div>

{visivel === 'informacoes' && (
<div className="mt-3">

<div className="config-wrapper">
  <div className="config-title small">
    Personalizar Cores
  </div>

  <div className="row">
    <div className="col-3">
      <label>Fundo:</label>
      <input
        type="color"
        className="form-control form-control-color mb-3 w-100"
        value={dadosTemplateAtivo.corFundo}
        onChange={(e) => {
          setTemplateAtivo(prev => ({ ...prev, corFundo: e.target.value }))
        }}
        onBlur={(e) => salvarCampo('backgroundcolor', e.target.value)}
      />
    </div>

    <div className="col-3">
      <label>Etiquetas:</label>
      <input
        type="color"
        className="form-control form-control-color mb-3 w-100"
        value={dadosTemplateAtivo.corEtiqueta}
        onChange={(e) => {
          setTemplateAtivo(prev => ({ ...prev, corEtiqueta: e.target.value }))
        }}
        onBlur={(e) => salvarCampo('etiquetacolor', e.target.value)}
      />
    </div>

    <div className="col-3">
      <label>Rodapé:</label>
      <input
        type="color"
        className="form-control form-control-color mb-3 w-100"
        value={dadosTemplateAtivo.corRodape}
        onChange={(e) => {
          setTemplateAtivo(prev => ({ ...prev, corRodape: e.target.value }))
        }}
        onBlur={(e) => salvarCampo('rodapecolor', e.target.value)}
      />
    </div>

    <div className="col-3">
      <label>Destaque:</label>
      <input
        type="color"
        className="form-control form-control-color mb-3 w-100"
        value={dadosTemplateAtivo.corDestaque}
        onChange={(e) => {
          setTemplateAtivo(prev => ({ ...prev, corDestaque: e.target.value }))
        }}
        onBlur={(e) => salvarCampo('backgroundcolordestaque', e.target.value)}
      />
    </div>
  </div>
</div>


      
    <label>Data Início</label><input type="date" className="form-control mb-3"
    defaultValue={desformatarData(dadosEncarte.datainicial)}
    onChange={(e) => {
              const valor = formatarData(e.target.value);
              setDadosEncarte(prev => ({...prev, 'datainicial': valor}));
              salvarCampo('data_inicial', valor);
            }} />


    <label>Data Final</label><input type="date" className="form-control"
      defaultValue={desformatarData(dadosEncarte.datafinal)}
    onChange={(e) => {
        const valor = formatarData(e.target.value);
        setDadosEncarte(prev => ({...prev, 'datafinal': valor}));
        salvarCampo('data_final', valor);
      }} />

<label className="switch mt-5">
  <input type="checkbox" 
   checked={dadosEncarte.estoque === '1'}
   onChange={(e) => {
    const isChecked = e.target.checked;
    setDadosEncarte(prev => ({ ...prev, 'estoque': isChecked ? '1' : '0' }));
    salvarCampo('estoque', isChecked ? '1' : '0');
  }} />
  <span className="slider"></span>
  Enquanto durar o estoque
</label>

<br/>

<label className="switch mt-2">
  <input type="checkbox"
  checked={dadosEncarte.imagemilustrativa === '1'}
  onChange={(e) => {
   const isChecked = e.target.checked;
   setDadosEncarte(prev => ({ ...prev, 'imagemilustrativa': isChecked ? '1' : '0' }));
   salvarCampo('imagemilustrativa', isChecked ? '1' : '0');
 }} />
  <span className="slider"></span>
  Imagem meramente ilustrativa
</label>

</div>)}


{visivel === 'contatos' && (
<div className="mt-3">

<label>Instagram</label><input type="text" className="form-control mb-3"
defaultValue={dadosEncarte.instagram} 
onChange={(e) => {
    setDadosEncarte(prev => ({...prev, 'instagram': e.target.value}));
    salvarCampo('instagram', e.target.value);
  }} />


<label>Telefone</label><input type="text" className="form-control mb-3"
defaultValue={dadosEncarte.telefone}
onChange={(e) => {
    setDadosEncarte(prev => ({...prev, 'telefone': e.target.value}));
    salvarCampo('telefone', e.target.value);
  }} />


<label>WhatsApp</label><input type="text" className="form-control mb-3" 
defaultValue={dadosEncarte.whatsapp}
onChange={(e) => {
  setDadosEncarte(prev => ({...prev, 'whatsapp': e.target.value}));
  salvarCampo('whatsapp', e.target.value);
            }}/>


            <label>Endereço</label><input type="text" className="form-control mb-3" 
defaultValue={dadosEncarte.endereco}
onChange={(e) => {
  setDadosEncarte(prev => ({...prev, 'endereco': e.target.value}));
  salvarCampo('endereco', e.target.value);
            }}/>

</div>)}



{visivel === 'logo' && (
<div className="mt-3">

<div className="mb-3 small">Envie sua logo</div>

<div className="files">
<label for="fileInput" className="input-file-label"><i className="fa-solid fa-upload"></i><br/>Escolher arquivo</label>
    <input type="file" accept="image/*" id="fileInput" className="input-file" 
    onChange={(e) => {
        const file = e.target.files[0];
        if (file) {
  setImagemParaProcessar(file);
  setShowModal(true); // abre o modal RemoverFundo
}
      }}/>
</div>

{uploading && (
            <div className="mt-2 small text-warning">
              {mensagem}
            </div>
          )}

          {!uploading && mensagem && (
            <div className="mt-2 small text-success">
              {mensagem}
            </div>
          )}


          {dadosEncarte.logo && (
          <div className="personalizarlogo mt-3">

           <div className="small mb-3">Escolha como sua logo aparece</div>

          <div className="row">

            <div className="col-4">
              <div className={`caixaimg ${bordalogo === '' ? 'ativo' : ''}`} onClick={() => { salvarCampo('bordalogo', ''); setDadosEncarte(prev => ({...prev, 'bordalogo': ''})); setBordaAtiva('')}}>
              <img src={dadosEncarte.logo} />
              </div>
            </div>

            <div className="col-4">
              <div className={`caixaimg ${bordalogo === 'white' ? 'ativo' : ''}`} onClick={() => { salvarCampo('bordalogo', 'white'); setDadosEncarte(prev => ({...prev, 'bordalogo': 'white'})); setBordaAtiva('white') }}>
              <img src={dadosEncarte.logo} className="bg-logo-white"/>
              </div>
            </div>

            <div className="col-4">
              <div className={`caixaimg ${bordalogo === 'black' ? 'ativo' : ''}`}  onClick={() => { salvarCampo('bordalogo', 'black'); setDadosEncarte(prev => ({...prev, 'bordalogo': 'black'})); setBordaAtiva('black') }}>
              <img src={dadosEncarte.logo} className="bg-logo-black"/>
              </div>
            </div>

          </div>

          <div className="mt-3">
            <span className="excluir link" onClick={() => { salvarCampo('logo', ''); setDadosEncarte(prev => ({...prev, 'logo': ''})) }}><i class="fa-solid fa-trash"></i> Excluir logo</span>
          </div>

          </div>)}

</div>
)}




{visivel === 'cartoes' && (
<div className="mt-3">

 <div className="small mb-3">Selecione os pagamentos aceitos em seu estabelecimento</div>



<div style={{
  display: "flex",
  flexWrap: "wrap",
  gap: "10px"
}}>
  {cartao.map(c => (
    <div
      key={c.id}
      onClick={() => toggleCartao(c)}
      style={{
        border: selecionados.some(s => s.id === c.id)
          ? "2px solid #007bff"
          : "2px solid #ccc",
        borderRadius: "5px",
        cursor: "pointer",
        padding: "3px",
        textAlign: "center",
        background: "#fff",
      }}
    >
      <img
        src={c.imagem}
        alt={c.nome}
        style={{
          width: "70px",
          height: "auto",
          objectFit: "contain"
        }}
      />
    </div>
  ))}
</div>



</div>)}


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


    </>)
}
export default Personalizar;
