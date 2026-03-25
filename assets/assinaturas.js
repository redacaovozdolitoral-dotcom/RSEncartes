import React, { useEffect, useState } from 'react';

function Assinaturas() {
  const [assinaturas, setAssinaturas] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [busca, setBusca] = useState(""); // <-- NOVO CAMPO DE BUSCA

  const assinaturasPorPagina = 15;

  useEffect(() => {
    fetch('https://enkartes.com/api/admin/assinaturas.php')
      .then(res => res.json())
      .then(data => setAssinaturas(data))
      .catch(err => console.error('Erro ao carregar assinaturas:', err));
  }, []);

  const formatarData = (dataStr) => {
    if (!dataStr) return '';
    const data = new Date(dataStr);
    if (isNaN(data)) return dataStr;
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  const statusPlano = (dataTerminoStr) => {
    if (!dataTerminoStr) return { texto: 'Plano expirado', cor: 'danger' };
    const hoje = new Date();
    const dataTermino = new Date(dataTerminoStr);
    return dataTermino >= hoje
      ? { texto: 'Plano ativo', cor: 'success' }
      : { texto: 'Plano expirado', cor: 'danger' };
  };

  // 🟦 FILTRAR ASSINATURAS PELA BUSCA
  const assinaturasFiltradas = assinaturas.filter(item => {
    const termo = busca.toLowerCase();
    return (
      item.nome.toLowerCase().includes(termo) ||
      item.email.toLowerCase().includes(termo) ||
      item.plano.toLowerCase().includes(termo) ||
      item.status.toLowerCase().includes(termo) ||
      item.tipo.toLowerCase().includes(termo)
    );
  });

  const totalPaginas = Math.ceil(assinaturasFiltradas.length / assinaturasPorPagina);

  const assinaturasExibidas = assinaturasFiltradas.slice(
    (paginaAtual - 1) * assinaturasPorPagina,
    paginaAtual * assinaturasPorPagina
  );

  const mudarPagina = (novaPagina) => {
    if (novaPagina >= 1 && novaPagina <= totalPaginas) {
      setPaginaAtual(novaPagina);
    }
  };

  const totalAtivas = assinaturas.filter(a => statusPlano(a.data_termino).texto === 'Plano ativo').length;
  const totalExpiradas = assinaturas.filter(a => statusPlano(a.data_termino).texto === 'Plano expirado').length;

  return (
    <div className="lista container">
      <h5 className="mb-4">Assinaturas</h5>

      <p className="text-muted mb-4">
        Total: {assinaturas.length} &nbsp;|&nbsp; 
        Ativas: <span className="text-success">{totalAtivas}</span> &nbsp;|&nbsp; 
        Expiradas: <span className="text-danger">{totalExpiradas}</span>
      </p>

      {/* 🟧 CAMPO DE BUSCA */}
      <input
        type="text"
        className="form-control mb-4"
        placeholder="Buscar por nome, email, plano..."
        value={busca}
        onChange={(e) => {
          setBusca(e.target.value);
          setPaginaAtual(1); // <-- resetar para página 1 ao buscar
        }}
      />

      <div className="row g-4">
        {assinaturasExibidas.map((item) => {
          const status = statusPlano(item.data_termino);
          return (
            <div key={item.id} className="col-md-6 col-lg-4">
              <div 
                className="card shadow-sm h-100 border-0"
                style={{ transition: 'transform 0.3s', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div className="card-body">
                  <h6 className="card-title mb-3">{item.nome} <small className="text-muted">({item.email})</small></h6>

                  <p className="mb-1"><strong>Plano:</strong> {item.plano}</p>
                  <p className="mb-1"><strong>Preço:</strong> R$ {parseFloat(item.preco).toFixed(2)}</p>
                  <p className="mb-1"><strong>Início:</strong> {formatarData(item.data_inicio)}</p>
                  <p className="mb-1"><strong>Término:</strong> {formatarData(item.data_termino)}</p>
                  <p className="mb-2">
                    <strong>Status do Plano:</strong>{' '}
                    <span className={`badge bg-${status.cor} text-white`}>
                      {status.texto}
                    </span>
                  </p>
                  <p className="mb-1"><strong>Status:</strong> {item.status}</p>
                  <p className="mb-0"><strong>Tipo:</strong> {item.tipo}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Paginação */}
      <nav className="d-flex justify-content-center my-5" aria-label="Paginação assinaturas">
        <ul className="pagination">
          <li className={`page-item ${paginaAtual === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => mudarPagina(paginaAtual - 1)}>Anterior</button>
          </li>

          {[...Array(totalPaginas)].map((_, index) => (
            <li key={index} className={`page-item ${paginaAtual === index + 1 ? 'active' : ''}`}>
              <button className="page-link" onClick={() => mudarPagina(index + 1)}>
                {index + 1}
              </button>
            </li>
          ))}

          <li className={`page-item ${paginaAtual === totalPaginas ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => mudarPagina(paginaAtual + 1)}>Próxima</button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Assinaturas;
