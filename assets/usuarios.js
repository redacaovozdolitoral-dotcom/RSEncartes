import React, { useEffect, useState } from 'react';
import { Modal } from 'bootstrap';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [assinaturas, setAssinaturas] = useState([]);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [modalAssinaturasUser, setModalAssinaturasUser] = useState(null);

  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    senha: "",
  });

  const [novaAssinatura, setNovaAssinatura] = useState({
    id_usuario: "",
    email: "",
    plano: "",
    preco: "",
    data_inicio: "",
    data_termino: "",
    tipo: "",
  });

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [busca, setBusca] = useState("");

  const usuariosPorPagina = 15;

  useEffect(() => {
    fetch("https://enkartes.com/api/admin/usuarios.php")
      .then((res) => res.json())
      .then((data) => setUsuarios(data));

    fetch("https://enkartes.com/api/admin/assinaturas.php")
      .then((res) => res.json())
      .then((data) => setAssinaturas(data));
  }, []);

  // -----------------------------------------------------
  // ASSINATURA DO USUÁRIO
  // -----------------------------------------------------
  const getAssinatura = (email) => {
    const assinatura = assinaturas.find((a) => a.email === email);
    if (!assinatura) return { status: "Não assinante", cor: "secondary" };

    const hoje = new Date();
    const termino = new Date(assinatura.data_termino);

    if (termino >= hoje)
      return {
        status: "Assinante ativo",
        cor: "success",
        plano: assinatura.plano,
        data_inicio: assinatura.data_inicio,
        data_termino: assinatura.data_termino,
      };

    return {
      status: "Assinatura expirada",
      cor: "danger",
      plano: assinatura.plano,
      data_inicio: assinatura.data_inicio,
      data_termino: assinatura.data_termino,
    };
  };

  const getAssinaturasUsuario = (email) => {
    return assinaturas.filter((a) => a.email === email);
  };

  // -----------------------------------------------------
  // MODAL ASSINATURAS
  // -----------------------------------------------------
  const abrirModalAssinaturas = (usuario) => {
    setModalAssinaturasUser(usuario);

    setNovaAssinatura({
      id_usuario: usuario.id,     // ✅ CORRIGIDO
      email: usuario.email,
      plano: "",
      preco: "",
      data_inicio: "",
      data_termino: "",
      tipo: "",                    // ✅ CORRIGIDO
    });

    const modal = new Modal(document.getElementById("modalAssinaturas"));
    modal.show();
  };

  const salvarNovaAssinatura = () => {
    console.log("ENVIANDO ASSINATURA:", novaAssinatura); // DEBUG

    fetch("https://enkartes.com/api/admin/add_assinatura.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novaAssinatura),
    })
      .then((res) => res.text())
      .then((r) => {
        alert("Assinatura adicionada!");
        console.log("RETORNO PHP:", r);

        fetch("https://enkartes.com/api/admin/assinaturas.php")
          .then((res) => res.json())
          .then((data) => setAssinaturas(data));

        const modal = Modal.getInstance(
          document.getElementById("modalAssinaturas")
        );
        modal.hide();
      });
  };

  // -----------------------------------------------------
  // MODAL EDITAR
  // -----------------------------------------------------
  const abrirModalEditar = (usuario) => {
    setUsuarioEditando(usuario);
    setFormData({
    ...usuario,
    senha: "", // 🔐 sempre vazio
  });
    setFormData(usuario);
    const modal = new Modal(document.getElementById("modalEditar"));
    modal.show();
  };

  const salvarEdicao = () => {
    fetch("https://enkartes.com/api/admin/editar_usuario.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.text())
      .then(() => {
        setUsuarios(
          usuarios.map((u) => (u.id === formData.id ? formData : u))
        );
        const modal = Modal.getInstance(
          document.getElementById("modalEditar")
        );
        modal.hide();
        alert('Dados alterados com sucesso!')
      });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // -----------------------------------------------------
  // BUSCA / PAGINAÇÃO
  // -----------------------------------------------------
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const termo = busca.toLowerCase();
    return (
      usuario.nome.toLowerCase().includes(termo) ||
      usuario.cpf.toLowerCase().includes(termo) ||
      usuario.email.toLowerCase().includes(termo) ||
      usuario.telefone.toLowerCase().includes(termo)
    );
  });

  const totalPaginas = Math.ceil(
    usuariosFiltrados.length / usuariosPorPagina
  );

  const usuariosExibidos = usuariosFiltrados.slice(
    (paginaAtual - 1) * usuariosPorPagina,
    paginaAtual * usuariosPorPagina
  );

  const mudarPagina = (novaPagina) => {
    if (novaPagina >= 1 && novaPagina <= totalPaginas) {
      setPaginaAtual(novaPagina);
    }
  };

  // -----------------------------------------------------
  // FORMATAR DATA
  // -----------------------------------------------------
  const formatarData = (dataStr) => {
    if (!dataStr) return "";
    const data = new Date(dataStr);
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const ano = String(data.getFullYear()).slice(-2);
    return `${dia}/${mes}/${ano}`;
  };

  // -----------------------------------------------------
  // RENDER
  // -----------------------------------------------------


  const deletarAssinatura = async (id) => {
  if (!window.confirm("Tem certeza que deseja excluir esta assinatura?")) return;

  try {
    const response = await fetch("https://enkartes.com/api/admin/delete_assinatura.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const json = await response.json();

    if (json.sucesso) {
      alert("Assinatura removida!");
      // recarrega assinaturas
      fetch("https://enkartes.com/api/admin/assinaturas.php")
        .then((res) => res.json())
        .then((data) => setAssinaturas(data));
    } else {
      alert("Erro ao excluir assinatura");
    }
  } catch (e) {
    console.error("Erro:", e);
  }
};



  return (
    <div className="lista container">
      <h5>Usuários</h5>

      {/* RESUMO */}
      <p className="text-muted mb-4">
        Total de usuários: {usuarios.length} &nbsp;|&nbsp;
        Assinaturas: {assinaturas.length} &nbsp;|&nbsp;
        Ativas: <span className="text-success">
          {assinaturas.filter(a => new Date(a.data_termino) >= new Date()).length}
        </span>
        &nbsp;|&nbsp;
        Expiradas: <span className="text-danger">
          {assinaturas.filter(a => new Date(a.data_termino) < new Date()).length}
        </span>
      </p>

      {/* BUSCA */}
      <input
        type="text"
        className="form-control mb-4"
        placeholder="Buscar por nome, CPF, e-mail ou WhatsApp..."
        value={busca}
        onChange={(e) => {
          setBusca(e.target.value);
          setPaginaAtual(1);
        }}
      />

      {/* LISTA */}
      {usuariosExibidos.map((usuario) => {
        const assinatura = getAssinatura(usuario.email);

        return (
          <div
            key={usuario.id}
            className="item-lista border p-3 mb-3 rounded shadow-sm"
          >
            <span
              className={`badge bg-${assinatura.cor}`}
              style={{ cursor: "pointer" }}
              onClick={() => abrirModalAssinaturas(usuario)}
            >
             <i class="fa-solid fa-magnifying-glass"></i> {assinatura.status}
            </span>

            <br /><br />

            <strong>Nome:</strong> {usuario.nome} <br />
            <strong>CPF:</strong> {usuario.cpf} <br />
            <strong>E-mail:</strong> {usuario.email} <br />
            <strong>WhatsApp:</strong> {usuario.telefone} <br />

            <button
              className="btn btn-sm btn-primary me-2 mt-2"
              onClick={() => abrirModalEditar(usuario)}
            >
              Editar
            </button>
          </div>
        );
      })}

      {/* PAGINACAO */}
      <nav className="d-flex justify-content-center my-4">
        <ul className="pagination">
          <li className={`page-item ${paginaAtual === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => mudarPagina(paginaAtual - 1)}>
              Anterior
            </button>
          </li>

          {[...Array(totalPaginas)].map((_, index) => (
            <li key={index} className={`page-item ${paginaAtual === index + 1 ? "active" : ""}`}>
              <button className="page-link" onClick={() => mudarPagina(index + 1)}>
                {index + 1}
              </button>
            </li>
          ))}

          <li className={`page-item ${paginaAtual === totalPaginas ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => mudarPagina(paginaAtual + 1)}>
              Próxima
            </button>
          </li>
        </ul>
      </nav>

      {/* ---------------------------------------------------------
         MODAL: ASSINATURAS
      ---------------------------------------------------------- */}
      <div
        className="modal fade"
        id="modalAssinaturas"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                Assinaturas de {modalAssinaturasUser?.nome}
              </h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body">
              <h6>Histórico</h6>

              <table className="table table-striped mb-4">
                <thead>
                  <tr>
                    <th>Plano</th>
                    <th>Preço</th>
                    <th>Tipo</th>
                    <th>Status</th>
                    <th>Início</th>
                    <th>Término</th>
                  </tr>
                </thead>
                <tbody>
  {modalAssinaturasUser &&
    getAssinaturasUsuario(modalAssinaturasUser.email).map((a, index) => (
      <tr key={index}>
        <td>{a.plano}</td>
        <td>R$ {a.preco}</td>
        <td>{a.tipo}</td>
        <td>{a.status}</td>
        <td>{formatarData(a.data_inicio)}</td>
        <td>{formatarData(a.data_termino)}</td>

        {/* ÍCONE DE EXCLUIR */}
        <td>
          <i
            className="fa-solid fa-trash text-danger"
            style={{ cursor: "pointer" }}
            title="Excluir assinatura"
            onClick={() => deletarAssinatura(a.id)}
          ></i>
        </td>
      </tr>
    ))}
</tbody>

              </table>

              <h6>Adicionar nova assinatura</h6>

              <div className="row">
                <div className="col-6 mb-3">
                  <label>Plano</label>
                  <select
                    className="form-control"
                    value={novaAssinatura.plano}
                    onChange={(e) =>
                      setNovaAssinatura({ ...novaAssinatura, plano: e.target.value })
                    }
                  >
                    <option value="">Selecione...</option>
                    <option value="mensal">Mensal</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>

                <div className="col-6 mb-3">
                  <label>Preço</label>
                  <input
                    type="number"
                    className="form-control"
                    value={novaAssinatura.preco}
                    onChange={(e) =>
                      setNovaAssinatura({ ...novaAssinatura, preco: e.target.value })
                    }
                  />
                </div>

                <div className="col-6 mb-3">
                  <label>Data início</label>
                  <input
                    type="date"
                    className="form-control"
                    value={novaAssinatura.data_inicio}
                    onChange={(e) =>
                      setNovaAssinatura({ ...novaAssinatura, data_inicio: e.target.value })
                    }
                  />
                </div>

                <div className="col-6 mb-3">
                  <label>Data término</label>
                  <input
                    type="date"
                    className="form-control"
                    value={novaAssinatura.data_termino}
                    onChange={(e) =>
                      setNovaAssinatura({ ...novaAssinatura, data_termino: e.target.value })
                    }
                  />
                </div>

                <div className="col-6 mb-3">
                  <label>Forma de Pagamento</label>
                  <select
                    className="form-control"
                    value={novaAssinatura.tipo}
                    onChange={(e) =>
                      setNovaAssinatura({ ...novaAssinatura, tipo: e.target.value }) // ✔ CORRIGIDO
                    }
                  >
                    <option value="">Selecione...</option>
                    <option value="cartao">Cartão</option>
                    <option value="pix">Pix</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Fechar
              </button>
              <button className="btn btn-success" onClick={salvarNovaAssinatura}>
                Salvar Assinatura
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------
         MODAL: EDITAR
      ---------------------------------------------------------- */}
      <div
        className="modal fade"
        id="modalEditar"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Editar Usuário</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <label>Nome</label>
                <input
                  type="text"
                  className="form-control"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label>CPF</label>
                <input
                  type="text"
                  className="form-control"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label>E-mail</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label>WhatsApp</label>
                <input
                  type="text"
                  className="form-control"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                />
              </div>


              <div className="mb-3">
              <label>Nova senha</label>
              <input
                type="password"
                className="form-control"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                placeholder="Deixe em branco para não alterar"
              />
              <small className="text-muted">
                Preencha somente se desejar alterar a senha
              </small>
            </div>

            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Cancelar
              </button>
              <button className="btn btn-success" onClick={salvarEdicao}>
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Usuarios;
