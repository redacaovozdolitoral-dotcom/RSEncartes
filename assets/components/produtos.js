import React, { useEffect, useState } from 'react';
import EnviarProduto from './enviarproduto.js';
import imagemIA from '../imagens/ia.png';
import Loading from '../imagens/loading.gif';
import Mover from '../icons/mover.svg';
import iconLoadingIA from '../../assets/imagens/ialoading.gif';
import RemoverFundo from './removerFundo.js';





function Produtos({setEncarte, setProdutoEditando, setVisivel, listarprodutos, setLoading, setPaginacao, idEncarte, isAuthenticated}) {

    const [resultadosprodutos, setResultadosProdutos] = useState([]);
    const [produtos, setProdutos] = useState([]); // Estado para armazenar os produtos adicionados ao encarte
    const [textareaValue, setTextareaValue] = useState(""); // Valor do textarea com a lista de produtos
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
  
  
   const [inputbuscar, setInputBuscar] = useState();
   const [imagens, setImagens] = useState([]);
   const [loadingimagens, setLoadingImagens] = useState(false);


   const [addproduto, setAddProduto] = useState(false);
   const [addlista, setAddLista] = useState(false);



const [removerBgModal, setRemoverBgModal] = useState(false);
const [imagemParaRemover, setImagemParaRemover] = useState(null);
const [processandoBg, setProcessandoBg] = useState(false);



const [imagemParaProcessar, setImagemParaProcessar] = useState(null);
const [showModal, setShowModal] = useState(false);
const [loadingIA, setLoadingIA] = useState(false);
const [previewIA, setPreviewIA] = useState(null);
   const [loadingUpload, setLoadingUpload] = useState(false);

const fileUploadRef = React.useRef(null);




const [imagensGoogle, setImagensGoogle] = useState([]);
const [loadingGoogle, setLoadingGoogle] = useState(false);



const atualizarProdutosDoEncarte = () => {

  
  if (!isAuthenticated) return;

  fetch(`https://enkartes.com/api/listarProdutosEncarte.php?id=${idEncarte}`)
    .then(response => response.json())
    .then(data => {
      setProdutos(data);
      setEncarte(data);
    })
    .catch(error => console.error('Erro ao buscar produtos do encarte:', error));
};



// BUSCAR LOCALMENTE QUANDO NAO CONECTADO
useEffect(() => {
  if (!isAuthenticated) {
    const chave = idEncarte ? "produtos_" + idEncarte : "produtos_local";
    const salvos = localStorage.getItem(chave);

    if (salvos) {
      try {
        const parsed = JSON.parse(salvos);
        setProdutos(parsed);
        setEncarte(parsed);
      } catch (err) {
        console.error('Erro ao parsear produtos do localStorage:', err);
      }
    }
  }
}, [idEncarte, isAuthenticated]);
          

         

      //SALVAR NO BANCO PRODUTOS ADICIONADOS AO ENCARTE
      const salvarProdutoNoEncarte = (produto, ordem = 0) => {


        if (!isAuthenticated) return;
      
        const dados = new URLSearchParams();
        dados.append('id_encarte', idEncarte);
        dados.append('titulo', produto.titulo);
        dados.append('preco', produto.preco);
        dados.append('unidade', produto.unidade);
        dados.append('imagem', produto.imagem);
        dados.append('tipopreco', 'simples');
        dados.append('destaque', produto.destaque || 0); // Usa o destaque definido no produto
        dados.append('ordem', ordem); 

   


        fetch('https://enkartes.com/api/salvarProdutoEncarte.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: dados.toString()
        })
          .then(response => response.json())
          .then(data => {
            console.log(data)
          
          })
          .catch(err => console.error('Erro ao salvar produto:', err));
      };

      
      
 useEffect(() => {

  
        if (!isAuthenticated) return;
            
             atualizarProdutosDoEncarte();

          }, [idEncarte, isAuthenticated]);




  const buscarImagemGoogle = (produtoNome) => {
  return fetch(`https://enkartes.com/api/buscarImagens.php?termo=${encodeURIComponent(produtoNome)}`)
    .then(response => response.json())
    .then(data => {
      // Se tiver uma imagem válida, retorna
      if (data && data.imagem) {
        return data.imagem;
      }
      // Se não, retorna imagem padrão
      return 'https://d1038wlozf3qar.cloudfront.net/imagens/produto-sem-imagem.png';
    })
    .catch(error => {
      console.error('Erro ao buscar a imagem:', error);
      return 'https://d1038wlozf3qar.cloudfront.net/imagens/produto-sem-imagem.png';
    });
};




const processarProdutos = async () => {
  setAddLista(false);

  const produtosArray = textareaValue
    .split('\n')
    .map(produto => produto.trim())
    .filter(Boolean);

  if (produtos.length + produtosArray.length > 30) {
    alert("Você não pode adicionar mais de 30 produtos.");
    setLoading(false);
    return;
  }

  const hasExistingDestaque = produtos.some(p => p.destaque == 1);

  // Cria a lista de novos produtos com imagem vazia
  const novosProdutos = produtosArray.map((produtoTexto, i) => {
    const regex = /^(.+?)\s(?:R?\$?\s?(\d{1,3}(?:[.,]\d{1,2})?))(?:\s+(.*))?$/i;
    const match = produtoTexto.match(regex);

    const nomeProduto = match ? match[1].trim() : produtoTexto;
    const precoProduto = match && match[2] ? match[2] : '0,00';
    const unidade = match && match[3] ? match[3].toLowerCase() : '';

    return {
      id: crypto.randomUUID(),
      id_encarte: idEncarte,
      titulo: nomeProduto,
      preco: precoProduto,
      unidade: unidade,
      tipopreco: 'simples',
      imagem: '', // vazio por enquanto
      destaque:  0,
      imagemCarregando: true,
      precode: '0,00',
      precopor: '0,00',
      titulodesconto: 'Leve 3 pague 2',
      precodesconto: '0,00',
      titulopreconormal: 'À Vista',
      precoavista: '0,00',
      tituloprecoparcelado: 'Em até 10x de',
      precoparcelado: '0,00',
      precocustomizado: 'oferta',
    };
  });

  // Atualiza o estado adicionando todos os novos produtos de uma vez
  setEncarte(prev => [...prev, ...novosProdutos]);
  setProdutos(prev => [...prev, ...novosProdutos]);
  setPaginacao(produtos.length + produtosArray.length);



  // Agora busca as imagens para cada produto, uma a uma, e atualiza o estado
  for (let i = 0; i < novosProdutos.length; i++) {
    const produto = novosProdutos[i];
    const imagem = await buscarImagemGoogle(produto.titulo);

    // Atualiza os estados produtos e encarte com a imagem e imagemCarregando false

    setEncarte(prev => {
      const copia = [...prev];
      const index = copia.findIndex(p => p.titulo === produto.titulo && p.imagem === '');
      if (index !== -1) {
        copia[index] = { ...copia[index], imagem, imagemCarregando: false };
      }
      return copia;
    });

     setProdutos(prev => {
      const copia = [...prev];
      const index = copia.findIndex(p => p.titulo === produto.titulo && p.imagem === '');
      if (index !== -1) {
        copia[index] = { ...copia[index], imagem, imagemCarregando: false };
      }
      return copia;
    });

    salvarProdutoNoEncarte({
      ...produto,
      imagem,
      imagemCarregando: false
    });
  }

  setAddLista(false);
  atualizarProdutosDoEncarte(); 
};






const handleDelete = async (id) => {
  const confirmDelete = window.confirm("Tem certeza que deseja excluir?");
  if (!confirmDelete) return;

  if (!isAuthenticated) {
    const nova = produtos.filter(item => item.id !== id);
    setProdutos(nova);
    setEncarte(nova);
    salvarLocal(nova, nova.length);
    setVisivel('produtos');
    return;
  }

  // versão existente para integração com API
  try {
    const response = await fetch(`https://enkartes.com/api/removerItem.php?id=${id}`);
    if (response.ok) {
      setEncarte((prev) => prev.filter((item) => item.id !== id));
      setProdutos((prev) => prev.filter((item) => item.id !== id));
      setVisivel('produtos');
    } else {
      console.error("Erro ao deletar:", response.statusText);
      alert("Falha ao deletar o produto.");
    }
  } catch (error) {
    console.error("Erro na requisição de deletar:", error);
    alert("Erro ao tentar deletar o produto.");
  }
};

          

const handleDeleteAll = async () => {
  const confirm = window.confirm("Tem certeza que deseja excluir TODOS os produtos?");
  if (!confirm) return;

  if (!idEncarte) {
    alert("ID do encarte não encontrado.");
    return;
  }

  const response = await fetch(`https://enkartes.com/api/removerTodosProdutos.php?id=${idEncarte}`); // Você precisa criar essa API também

  if (response.ok) {
    console.log("Todos os produtos deletados com sucesso.");
    setEncarte([]);
    setProdutos([]);
    setVisivel('produtos');
  } else {
    console.error("Erro ao deletar todos:", response.statusText);
    alert("Falha ao deletar todos os produtos.");
  }
};


const handleDragStart = ( index) => {
  setDraggedIndex(index);
};

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);  // Indica onde o produto será solto
  };

  const handleDrop = (index) => {
    const items = [...produtos];
    const draggedItem = items[draggedIndex];
    items.splice(draggedIndex, 1);
    items.splice(index, 0, draggedItem);
    setProdutos(items);
    setEncarte(items);
    salvarOrdemNoBanco(items);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const salvarOrdemNoBanco = async (novaOrdem) => {
        if (!isAuthenticated) return;
    try {
      const response = await fetch("https://enkartes.com/api/ordenarProdutos.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            produtos: novaOrdem.map((produto, index) => ({
            id: produto.id,
             ordem: novaOrdem.length - index
          })),
        }),
      });

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Erro ao salvar ordem:", error);
    }
  };


const Destacar = async (idproduto, destaqueAtual) => {
  // se não está autenticado: apenas altera localmente e salva no localStorage
  if (!isAuthenticated) {
    setProdutos(prev => {
      const nova = prev.map(p => {
        if (p.id === idproduto) {
          // trata strings e numbers
          const atual = (p.destaque === 1 || p.destaque === '1') ? 1 : 0;
          const novo = atual === 1 ? 0 : 1;
          return { ...p, destaque: novo };
        }
        return p;
      });
      setEncarte(nova);
      salvarLocal(nova, nova.length);
      return nova;
    });
    return;
  }

  // se autenticado: chama a API para alternar o destaque
  try {
    const novoValor = (destaqueAtual == "1" || destaqueAtual == 1) ? "0" : "1";

    const dados = new URLSearchParams();
    dados.append('id', idproduto);
    dados.append('destaque', novoValor);

    const response = await fetch('https://enkartes.com/api/destacarProduto.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: dados.toString(),
    });

    const data = await response.json();
    console.log(data);

    setProdutos(prev =>
      prev.map(produto =>
        produto.id === idproduto ? { ...produto, destaque: novoValor } : produto
      )
    );

    // atualiza a partir do servidor (mantém seu fluxo atual)
    atualizarProdutosDoEncarte();
  } catch (err) {
    console.error('Erro ao destacar produto:', err);
  }
};





  const buscarImagem = async (termo) => {

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
  


// utilitário para salvar localmente (use quando for necessário)
const salvarLocal = (lista, paginacao) => {
  try {
    const chave = idEncarte ? ('produtos_' + idEncarte) : 'produtos_local';
    const chavePaginacao = idEncarte ? ('paginacao') : 'paginacao_local';
    localStorage.setItem(chave, JSON.stringify(lista));
    localStorage.setItem(chavePaginacao, String(paginacao));
  } catch (err) {
    console.error('Erro ao salvar produtos no localStorage:', err);
  }
};



  const adicionarProduto = async (nome, imagem) => {


    
  if (!idEncarte) {
    alert('ID do encarte não encontrado.');
    return;
  }

  if (produtos.length >= 30) {
    alert("Você não pode adicionar mais de 30 produtos.");
    return;
  }


  const novoProduto = {
     id: crypto.randomUUID(),
    id_encarte: idEncarte,
    titulo: nome,
    preco: '0,00',
    unidade: '',
    imagem: imagem,
    tipopreco: 'simples',
    destaque: 0,
    imagemCarregando: false,
    precode: '0,00',
    precopor: '0,00',
    titulodesconto: 'Leve 3 pague 2',
    precodesconto: '0,00',
    titulopreconormal: 'À Vista',
    precoavista: '0,00',
    tituloprecoparcelado: 'Em até 10x de',
    precoparcelado: '0,00',
    precocustomizado: 'oferta',



  };

  // Atualiza a tela imediatamente
// Atualiza estados SEM depender do valor antigo
  setProdutos(prev => {
    const novoArray = [novoProduto, ...prev];
    setEncarte(novoArray);
    setPaginacao(novoArray.length); 
     if (!isAuthenticated) salvarLocal(novoArray, novoArray.length); // salva localmente
    return novoArray;
  });



  // Salva no banco
  const ordem = produtos.length + 1;
  salvarProdutoNoEncarte(novoProduto, ordem);

};




    // Função para editar um produto
    const editarProduto = (produto) => {
      setProdutoEditando(produto); // Preenche o formulário de edição com os dados do produto
      setVisivel('editar');
      
    };


    



const fazerUpload = () => {
  fileUploadRef.current.click();
};

const handleUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  setImagemParaProcessar(file); // guarda a imagem
  setShowModal(true);           // abre o modal para escolher
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
        // 👉 só preview
        setPreviewIA(data.url);
      } else {
        // upload normal → cria produto direto
        const nomeProduto = imagemParaProcessar.name.replace(/\.[^/.]+$/, "");
        adicionarProduto(nomeProduto, data.url);
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

const confirmarUsoImagemIA = () => {
  if (!previewIA) return;

  const nomeProduto = imagemParaProcessar.name.replace(/\.[^/.]+$/, "");

  adicionarProduto(nomeProduto, previewIA);

  setPreviewIA(null);
  setImagemParaProcessar(null);
  setShowModal(false);
};



const buscarGoogle = async (descricao) => {
  if (!descricao || descricao.trim() === "") return;

  setLoadingGoogle(true);
  setImagensGoogle([]);

  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=AIzaSyDxEeGZwxr9Xedp5N7qUWvECg7tY3602No&cx=cafd154b2b4bee756&searchType=image&q=${encodeURIComponent(descricao)}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data?.items?.length > 0) {
      const lista = data.items.map((item) => ({
        thumb: item.image.thumbnailLink,
        url: "https://images.weserv.nl/?url=" + item.link.replace(/^https?:\/\//, "")
      }));

      setImagensGoogle(lista);
    } else {
      setImagensGoogle([]);
    }
  } catch (err) {
    console.error("Erro na busca Google:", err);
  }

  setLoadingGoogle(false);
};



      
    return(<>



    <div className="mb-3">
      <button onClick={()=>  setAddProduto(true) } className="botao-linha mb-3"><i class="fa-solid fa-cart-plus"></i> Adicionar Produto</button>
      <button onClick={()=>  setAddLista(true) } className="botao-linha"><i class="fa-solid fa-list"></i> Adicionar Lista</button>

    </div>


{addproduto &&(
  <div className="modalbox">
<div className="mb-3 bg-light rounded border p-3">

  <strong>Adicionar Produto</strong>
  
  <hr/>

   <button onClick={()=> setAddProduto(false) }  className="btn btn-danger btn-sm position-absolute" style={{ top: '7px', right: '7px' }}>
    <i className="fa-solid fa-xmark"></i>
  </button>

      <label>Buscar um produto</label>

  <form onSubmit={(e) => { e.preventDefault(); buscarImagem(inputbuscar); }}>
<div className="d-flex gap-1">

       <input type="text" placeholder="Digite o nome do produto"
        onChange={(e) => setInputBuscar(e.target.value)}
        className="form-control"/>

 <button type="submit" className="btn btn-principal"><i class="fa-solid fa-magnifying-glass"></i></button>
   </div>    
 </form>

   {!loadingimagens ? (
    <div>


            <div className="mt-3 listar-imagens">

              
                {imagens.map((img, i) => (
                  <img key={i} src={img.imagem}
                    onClick={() => adicionarProduto(img.nome, img.imagem)}

                    className="img" alt="Resultado" />
                ))}
              </div>

              
          
        </div>

          ) :
          (<span className="small"><i className="fa-solid fa-circle-notch fa-spin"></i> Carregando imagens...</span>)}


{!loadingimagens && imagens.length >= 1 && (
  <div style={{textAlign:"center", marginTop:"20px"}}>
    <button 
      onClick={() => buscarGoogle(inputbuscar)}
      className="botao-linha mb-3"
    >
      ❓ Não encontrou a imagem? Buscar no Google
    </button>
  </div>
)}


{loadingGoogle && (
  <div style={{textAlign:"center", marginTop:"10px"}}>
    <img src={Loading} width="50" />
    <p>Buscando imagens no Google...</p>
  </div>
)}

{!loadingGoogle && imagensGoogle.length > 0 && (
  <div className="mb-3" style={{marginTop:"15px"}}>
    <p className="text-muted">Imagens da Web:</p>

    <div className="mt-3 listar-imagens">


      {imagensGoogle.map((img, index) => (
                  <img key={index} src={img.thumb}
                    onClick={() => adicionarProduto(inputbuscar, img.url)}

                    className="img" alt="Resultado" />
                ))}



      </div>
      </div>

    
)}


<span className="small">ou se preferir</span>
<button onClick={()=>  fazerUpload() } className="botao mb-3"><i class="fa-solid fa-upload"></i> Fazer Upload</button>
<input
  type="file"
  ref={fileUploadRef}
  style={{ display: "none" }}
  accept="image/*"
  onChange={handleUpload}
/>

</div>
</div>)}
    

{addlista &&(
  <div className="modalbox">
<div className="mb-3 bg-light rounded border p-3">

  <strong>Adicionar Lista</strong>
   <hr/>

   <button onClick={()=> setAddLista(false) }  className="btn btn-danger btn-sm position-absolute" style={{ top: '7px', right: '7px' }}>
    <i className="fa-solid fa-xmark"></i>
  </button>


    <div className="small mb-3">
  <img src={imagemIA} width="15" className="me-1"/>Digite o nome do produto ou cole sua lista de produtos. Ex.:<br/>
    
    Nome do produto 9,00 kg <br/>
    Nome do produto 7,50 cada <br/>
    Nome do produto 29,90 unidade<br/>
    ...
    </div>
        <textarea
                className="form-control mb-3"
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
                placeholder="Digite a lista de produtos (um por linha)"
                rows={5}
            />
              
                <button className="botao" onClick={processarProdutos}>Adicionar ao Encarte</button>
               
</div>
</div>)}







                <div className="mt-4">


                <div className="d-flex justify-content-between mb-3">
                  <span>Produtos do encarte</span>
                  {(produtos.length >=1 && idEncarte) && (<span className="small link" onClick={handleDeleteAll}><i className="fa-solid fa-trash"></i> Remover todos</span>)}
                </div>



               {produtos.map((produto, index) => (

  <div
    key={produto.id}
    className={` listar w-100 ${
      dragOverIndex === index ? 'drop-zone-active' : ''
    } ${draggedIndex === index ? 'dragging' : ''}`}
    draggable
    onDragStart={() => handleDragStart(index)}
    onDragOver={(e) => {
      e.preventDefault();
      setDragOverIndex(index);
    }}
    onDrop={() => handleDrop(index)}
    onDragEnter={() => setDragOverIndex(index)}
    onDragLeave={() => setDragOverIndex(null)}
    style={{ transition: '0.3s', cursor: 'move' }}
  >
    <div className="img produto-box" onClick={() => editarProduto(produto)}>
      <img
        src={produto.imagemCarregando ? Loading : produto.imagem}
        width="40px"
        alt={produto.titulo}
      />
      <div className="titulo-limitado">{produto.titulo}</div>
    </div>
    <div>
      <i
        className={`fa-${produto.destaque === 0 ? 'regular' : 'solid'} fa-star pe-3`}
        title="Destaque"
        onClick={() => Destacar(produto.id, produto.destaque)}
        style={{ cursor: 'pointer' }}
      ></i>
      <i
        className="fa-solid fa-trash"
        style={{ cursor: 'pointer' }}
        onClick={() => handleDelete(produto.id)}
      ></i>
    </div>
  </div>
))}



                </div>


     {isAuthenticated && resultadosprodutos != '' &&(
        <EnviarProduto 
        setEncarte={setEncarte}
        produtoEditando={setProdutoEditando}
        setVisivel={setVisivel}
        />
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

   </>)
}export default Produtos;
