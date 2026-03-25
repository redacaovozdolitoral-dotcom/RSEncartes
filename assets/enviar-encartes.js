import React, { useEffect, useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import 'bootstrap/dist/css/bootstrap.min.css';
import CreatableSelect from "react-select/creatable";



function Encartes() {
  const isAuthenticated = localStorage.getItem('user');
  const usuario = JSON.parse(localStorage.getItem('user'));


  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedPixels, setCroppedPixels] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [plano, setPlano] = useState('gratis');
  const [categorias, setCategorias] = useState([]);
  const [corFundo, setCorFundo] = useState("#000000");
  const [corDestaque, setCorDestaque] = useState("#000000");
  const [corEtiqueta, setCorEtiqueta] = useState("#000000");
  const [corRodape, setCorRodape] = useState("#000000");
  const [listarcategorias, setListarCategorias] = useState([]);
  const [mensagem, setMensagem] = useState(false);

  const [editandoId, setEditandoId] = useState(null);
const [thumbAtual, setThumbAtual] = useState(null);

  const [templates, setTemplates] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const porPagina = 6;

  useEffect(() => {
    fetch(`https://enkartes.com/api/listarCategorias.php`)
      .then(res => res.json())
      .then(data => setListarCategorias(data))
      .catch(error => console.error('Erro ao buscar categorias:', error));

    fetchTemplates();
  }, []);

  const fetchTemplates = () => {
    fetch('https://enkartes.com/api/admin/modelos_encartes.php')
      .then(res => res.json())
      .then(data => setTemplates(data));
  };

  const excluirTemplate = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir?")) return;

    const res = await fetch(`https://enkartes.com/api/admin/excluir_modelo.php?id=${id}`, {
      method: 'DELETE',
    });

    const json = await res.json();
    if (json.status === 'ok') {
      fetchTemplates();
    }
  };

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedPixels(croppedAreaPixels);
  }, []);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  const getThumbBlob = async () => {
    const img = new Image();
    img.src = image;
    await new Promise((resolve) => (img.onload = resolve));

    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 250;
    const ctx = canvas.getContext('2d');

    const { x, y, width, height } = croppedPixels;
    ctx.drawImage(img, x, y, width, height, 0, 0, 400, 250);

    return new Promise((resolve) =>
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg')
    );
  };

  const handleUpload = async () => {
    if (!isAuthenticated) return;

    setMensagem(true);
    const originalFile = document.querySelector('input[type="file"]').files[0];
    const thumbBlob = await getThumbBlob();

    const formData = new FormData();
    formData.append('original', originalFile);
    formData.append('thumb', thumbBlob);
    formData.append('titulo', titulo);
    formData.append('categorias[]', categorias);
    formData.append('corfundo', corFundo);
    formData.append('cordestaque', corDestaque);
    formData.append('coretiqueta', corEtiqueta);
    formData.append('corrodape', corRodape);
    formData.append('plano', plano);

    const res = await fetch('https://enkartes.com/api/enviarTemplate.php', {
      method: 'POST',
      body: formData
    });

    const json = await res.json();
    setMensagem(false);
    if (json.status === 'ok') {
      alert('Template enviado com sucesso!');
      fetchTemplates();
    } else {
      alert('Erro ao enviar template.');
    }
  };

  // Paginação
  const totalPaginas = Math.ceil(templates.length / porPagina);
  const paginados = templates.slice((paginaAtual - 1) * porPagina, paginaAtual * porPagina);



  const editarTemplate = (tpl) => {
  setEditandoId(tpl.id);
  setTitulo(tpl.titulo);
  setPlano(tpl.plano);
  setCategorias(
  tpl.categoria
    ? tpl.categoria.split(',').map(c => c.trim())
    : []
);
  setCorFundo(tpl.backgroundcolor || '#000000');
setCorDestaque(tpl.backgroundcolordestaque || '#000000');
setCorEtiqueta(tpl.etiquetacolor || '#000000');
setCorRodape(tpl.rodapecolor || '#000000');
  setThumbAtual(tpl.thumb);
  setImage(null); // imagem só se trocar
};


const handleUpdate = async () => {
  setMensagem(true);

  const formData = new FormData();
  formData.append('id', editandoId);
  formData.append('titulo', titulo);
  formData.append('categorias[]', categorias);
  formData.append('corfundo', corFundo);
  formData.append('cordestaque', corDestaque);
  formData.append('coretiqueta', corEtiqueta);
  formData.append('corrodape', corRodape);
  formData.append('plano', plano);

  // Só envia imagem se trocar
  if (image) {
    const originalFile = document.querySelector('input[type="file"]').files[0];
    const thumbBlob = await getThumbBlob();
    formData.append('original', originalFile);
    formData.append('thumb', thumbBlob);
  }

  const res = await fetch('https://enkartes.com/api/admin/editar_modelo.php', {
    method: 'POST',
    body: formData
  });

  const json = await res.json();
  setMensagem(false);

  if (json.status === 'ok') {
    alert('Tema atualizado com sucesso!');
    fetchTemplates();
    limparFormulario();
  } else {
    alert('Erro ao atualizar tema');
  }
};


const limparFormulario = () => {
  setEditandoId(null);
  setTitulo('');
  setCategorias([]);
  setCorFundo('#000000');
  setCorDestaque('#000000');
  setCorEtiqueta('#000000');
  setCorRodape('#000000');
  setPlano('gratis');
  setImage(null);
  setThumbAtual(null);
};





  return (
    <div className="container">
      <div className="row">
        {/* Formulário de Envio */}
        <div className="col-md-6">
          <div className="bg-white rounded border p-4">
            {!editandoId ? (
          <h5 className="mb-3">Enviar</h5>
            ) : (<h5 className="mb-3">Editar</h5>)}
          <input type="text" className="form-control mb-3" placeholder="Título"  value={titulo} onChange={(e) => setTitulo(e.target.value)} />

          <select
            className="form-control mb-3"
            value={plano}
            onChange={(e) => setPlano(e.target.value)}
          >
            <option value="gratis">Grátis</option>
            <option value="premium">Premium</option>
          </select>

          <div className="mb-3">
  <strong className="small d-block mb-2">Categorias:</strong>

  <CreatableSelect
  isMulti
  value={categorias.map(c => ({ value: c, label: c }))} // << ADICIONE ISSO
  placeholder="Buscar ou adicionar categoria…"
  className="basic-multi-select"
  classNamePrefix="select"
  options={listarcategorias.map(cat => ({
    value: cat.titulo,
    label: cat.titulo
  }))}
  onChange={(selected) => {
    setCategorias(selected ? selected.map(s => s.value) : []);
  }}
    formatCreateLabel={(inputValue) => `Criar categoria: "${inputValue}"`}
onCreateOption={async (inputValue) => {
  const novaCategoria = {
    value: inputValue,
    label: inputValue
  };

  // 1 — Adiciona imediatamente na lista visível
  setListarCategorias(prev => [...prev, { titulo: inputValue }]);

  // 2 — Adiciona aos selecionados
  setCategorias(prev => [...prev, inputValue]);

  // 3 — Envia para o servidor e aguarda (opcional)
  await fetch("https://enkartes.com/api/admin/addCategoria.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ titulo: inputValue })
  });
}}

/>

</div>

  <strong className="small d-block mb-2">Arquivo:</strong>
          <input type="file" className="form-control mb-3" onChange={handleFile} />


          {!image && thumbAtual && (
          <img
          width={100}
            src={thumbAtual}
            alt="Thumb atual"
            className="img-fluid mb-2 rounded"
          />
        )}

          {image && (
            <div style={{ width: '100%', height: 200, position: 'relative' }} className="mb-3">
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={400 / 250}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
          )}

          <div className="row mb-3">
            <div className="col-6 col-md-3">
              <label>Fundo</label>
              <input type="color" value={corFundo} onChange={(e) => setCorFundo(e.target.value)} className="form-control w-100 form-control-color" />
            </div>
            <div className="col-6 col-md-3">
              <label>Etiqueta</label>
              <input type="color" value={corEtiqueta} onChange={(e) => setCorEtiqueta(e.target.value)} className="form-control  w-100 form-control-color" />
            </div>
            <div className="col-6 col-md-3">
              <label>Rodapé</label>
              <input type="color" value={corRodape} onChange={(e) => setCorRodape(e.target.value)} className="form-control  w-100 form-control-color" />
            </div>
            <div className="col-6 col-md-3">
              <label>Destaque</label>
              <input type="color" value={corDestaque} onChange={(e) => setCorDestaque(e.target.value)} className="form-control  w-100 form-control-color" />
            </div>
          </div>

<div className="d-flex gap-2">


  {/* BOTÃO CANCELAR EDIÇÃO */}
{editandoId && (
  <button
    className="btn btn-outline-secondary w-100"
    onClick={limparFormulario}
  >
    Cancelar edição
  </button>
)}


          <button
  className={`btn btn-primary w-100`}
  onClick={editandoId ? handleUpdate : handleUpload}
>
  {editandoId ? 'Atualizar Tema' : 'Enviar'}
</button>


</div>


          {mensagem && <div className="text-muted mt-2">Enviando...</div>}
        </div>
        </div>

        {/* Lista de Templates */}
        <div className="col-md-6">
          <div className="lista border bg-white rounded p-4">
  <h5 className="mb-3">Temas</h5>
   <p className="text-muted">Total de temas: {templates.length}</p>
  <div className="d-flex flex-column gap-3">
  {paginados.map((tpl) => (
    <div className="card" key={tpl.id}>
      <div className="card-body d-flex align-items-center justify-content-between">
      <img src={`${tpl.thumb}`} className="rounded" alt={tpl.titulo} style={{    width: '70px', height: '100%'  }} />

        <h6 className="card-title" title={tpl.titulo}>{tpl.titulo}</h6>
<div>
            <button
            className="btn btn-sm btn-outline-primary me-2"
            onClick={() => editarTemplate(tpl)}
                >
                  Editar
                </button>


        {usuario?.nivel !== 'design' && (
          <button className="btn btn-sm btn-outline-danger" onClick={() => excluirTemplate(tpl.id)}>
            Excluir
          </button>
        )}
        </div>
      </div>
    </div>
  ))}
</div>



          {/* Paginação */}

 <div className="paginacao mt-4 d-flex justify-content-center">
  <nav>
    <ul className="pagination">
      <li className={`page-item ${paginaAtual === 1 ? 'disabled' : ''}`}>
        <button className="page-link" onClick={() => setPaginaAtual(paginaAtual - 1)}>Anterior</button>
      </li>

      {Array.from({ length: totalPaginas }, (_, index) => index + 1)
        .filter(p => 
          p === 1 || 
          p === totalPaginas || 
          (p >= paginaAtual - 1 && p <= paginaAtual + 2)
        )
        .map((pagina, index, array) => (
          <li key={pagina} className={`page-item ${pagina === paginaAtual ? 'active' : ''}`}>
            <button className="page-link" onClick={() => setPaginaAtual(pagina)}>
              {pagina}
            </button>
          </li>
      ))}

      <li className={`page-item ${paginaAtual === totalPaginas ? 'disabled' : ''}`}>
        <button className="page-link" onClick={() => setPaginaAtual(paginaAtual + 1)}>Próximo</button>
      </li>
    </ul>
  </nav>
</div>

</div>

        </div>
      </div>
    </div>
  );
}

export default Encartes;
