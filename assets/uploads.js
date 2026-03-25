import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function UploadPage() {
  const [abaAtiva, setAbaAtiva] = useState('produtos');
  const [tipo, setTipo] = useState('formas');
  const [titulo, setTitulo] = useState('');
  const [svgContent, setSvgContent] = useState('');
  const [arquivo, setArquivo] = useState(null);
  const [mensagem, setMensagem] = useState('');


  //PRODUTOS 
const [arquivos, setArquivos] = useState([]);
  const [log, setLog] = useState('');
  const [progresso, setProgresso] = useState(0);
  const [erros, setErros] = useState(new Map());


   const handleSelecionar = (e) => {
    setArquivos(Array.from(e.target.files));
    setLog('');
    setProgresso(0);
    setErros(new Map());
  };

const iniciarUpload = async () => {
  const loteTamanho = 10;
  let enviados = 0;
  const novosErros = new Map();

  for (let i = 0; i < arquivos.length; i += loteTamanho) {
    const lote = arquivos.slice(i, i + loteTamanho);
    const formData = new FormData();
    lote.forEach((file) => formData.append('imagens[]', file));

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progressoAtual = ((enviados + event.loaded / event.total * lote.length) / arquivos.length) * 100;
        setProgresso(progressoAtual);
      }
    };

    xhr.onload = () => {
      const texto = xhr.responseText;
      setLog((prev) => prev + texto + '\n');

      texto.split('\n').forEach((linha) => {
        if (linha.includes('❌')) {
          const nome = extrairNomeArquivoErro(linha);
          const arq = arquivos.find(f => f.name === nome);
          if (arq) novosErros.set(nome, arq);
        }
      });

      enviados += lote.length;
      setProgresso((enviados / arquivos.length) * 100);

      if (i + loteTamanho >= arquivos.length) {
        setErros(novosErros);
        setLog((prev) => prev + '\n✅ Todos os uploads finalizados!');
      }
    };

    xhr.onerror = () => {
      setLog((prev) => prev + `❌ Falha ao enviar lote ${(i / loteTamanho) + 1}\n`);
      enviados += lote.length;
      setProgresso((enviados / arquivos.length) * 100);
    };

    xhr.open('POST', 'https://enkartes.com/api/admin/enviar_produtos.php');
    xhr.send(formData);
    
    // Aguarda a finalização antes de enviar o próximo lote
    await new Promise((resolve) => {
      xhr.onloadend = resolve;
    });
  }
};
  const extrairNomeArquivoErro = (linha) => {
    const match = linha.match(/❌.*?:\s*(.+\.png)/);
    return match ? match[1].trim() : '';
  };

  const reenviar = async (nome) => {
    const arquivo = erros.get(nome);
    if (!arquivo) return;

    const formData = new FormData();
    formData.append('imagens[]', arquivo);

    const res = await fetch('https://SEUSITE.com/api/upload_produtos.php', {
      method: 'POST',
      body: formData
    });
    const texto = await res.text();
    setLog((prev) => prev + texto + '\n');

    if (texto.includes('✅')) {
      const novos = new Map(erros);
      novos.delete(nome);
      setErros(novos);
    }
  };



  const handleArquivo = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const texto = event.target.result;
        const match = texto.match(/<svg[\s\S]*?<\/svg>/);
        if (match) {
          setSvgContent(match[0]);
          setMensagem('SVG lido com sucesso!');
        } else {
          setMensagem('Erro: não foi possível extrair o SVG.');
        }
      };
      reader.readAsText(file);
      setArquivo(file);
    } else {
      setMensagem('Por favor, selecione um arquivo SVG válido.');
    }
  };

  const handleEnviar = async () => {
    if (!titulo || !svgContent || !tipo) {
      setMensagem('Preencha todos os campos!');
      return;
    }

    const body = {
      titulo,
      tipo,
      svg: svgContent
    };

    const res = await fetch('https://enkartes.com/api/admin/salvar_elemento.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const json = await res.json();
    if (json.status === 'ok') {
      setMensagem('Elemento salvo com sucesso!');
      setTitulo('');
      setSvgContent('');
      setArquivo(null);
    } else {
      setMensagem('Erro ao salvar elemento.');
    }
  };

  return (
    <div className="container mt-4">
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${abaAtiva === 'produtos' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('produtos')}
          >
            Upload Produtos
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${abaAtiva === 'elementos' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('elementos')}
          >
            Upload Elementos
          </button>
        </li>
      </ul>

      {abaAtiva === 'elementos' && (
        <div className="bg-light p-4 rounded shadow-sm">
          <h6 className="mb-3">Enviar Elemento SVG</h6>
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Título do SVG"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
          <select className="form-control mb-3" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="formas">Formas</option>
            <option value="icones">Ícones</option>
          </select>
          <input type="file" className="form-control mb-3" accept=".svg" onChange={handleArquivo} />

          {svgContent && (
            <div className="mb-3">
              <strong>Pré-visualização:</strong>
              <div dangerouslySetInnerHTML={{ __html: svgContent }} />
            </div>
          )}

          <button className="btn btn-primary" onClick={handleEnviar}>Salvar Elemento</button>
          {mensagem && <div className="mt-3 alert alert-info">{mensagem}</div>}
        </div>
      )}

      {abaAtiva === 'produtos' && (
        <div className="p-4 bg-light rounded shadow-sm">
          <h6>Upload de Produtos</h6>
          

     <div className="p-4 bg-light rounded shadow-sm">
      <input type="file" multiple accept="image/png" onChange={handleSelecionar} className="form-control mb-3" />
      <button className="btn btn-primary mb-3" onClick={iniciarUpload}>Iniciar Upload</button>

 {progresso > 1 && (
      <div>
      <progress value={progresso} max="100" className="w-100 mb-3" />
      <pre className="bg-white border p-3 mb-3" style={{ maxHeight: '300px', overflowY: 'auto', whiteSpace: 'pre-line' }}>{log}</pre>
      </div>)}
 
      {erros.size > 0 && <>
        <h6>Arquivos com erro:</h6>
        {[...erros.entries()].map(([nome], i) => (
          <div key={i} className="d-flex align-items-center gap-2 mb-2">
            <span>{nome}</span>
            <button className="btn btn-sm btn-outline-danger" onClick={() => reenviar(nome)}>Reenviar</button>
          </div>
        ))}
      </>}
    </div>


        </div>
      )}
    </div>
  );
}

export default UploadPage;
