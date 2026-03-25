import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import './admin.css';
import Usuarios from './usuarios';
import Assinaturas from './assinaturas';
import Encartes from './enviar-encartes';
import Uploads from './uploads';

function Admin() {
  const usuario = JSON.parse(localStorage.getItem("user"));
  const location = useLocation();

  // Se não estiver logado ou não for admin, redireciona
  if (!usuario || usuario.nivel !== "admin" && usuario.nivel !== "design") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="dashboard container-fluid">
      <div className="row">
        <div className="col-lg-2">
          <ul className="list-menu">

  {usuario.nivel === "admin" && (
    <>
      <li className={location.pathname === "/admin/usuarios" ? "active" : ""}>
        <Link to="/admin/usuarios">Usuários</Link>
      </li>


      
  {(usuario.nivel === "admin" || usuario.nivel === "design") && (
    <li className={location.pathname === "/admin/encartes" ? "active" : ""}>
      <Link to="/admin/encartes">Encartes</Link>
    </li>
  )}

     

      <li className={location.pathname === "/admin/uploads" ? "active" : ""}>
        <Link to="/admin/uploads">Uploads</Link>
      </li>
    </>
  )}


</ul>

        </div>

        <div className="col-lg-10">
         <Routes>
          {/* ADMIN TEM ACESSO TOTAL */}
          {usuario.nivel === "admin" && (
            <>
              <Route path="/" element={<Usuarios />} />
              <Route path="usuarios" element={<Usuarios />} />
              <Route path="assinaturas" element={<Assinaturas />} />
              <Route path="uploads" element={<Uploads />} />
              <Route path="encartes" element={<Encartes />} />
            </>
          )}

          {/* DESIGN SÓ ACESSA ENCARTES */}
          {usuario.nivel === "design" && (
            <Route path="encartes" element={<Encartes />} />
          )}

          {/* QUALQUER OUTRA ROTA REDIRECIONA */}
          <Route path="*" element={<Navigate to="/admin/encartes" replace />} />
        </Routes>

        </div>
      </div>
    </div>
  );
}

export default Admin;
