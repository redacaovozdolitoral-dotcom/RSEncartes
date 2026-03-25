import { Link } from 'react-router-dom';
import Logo from '../imagens/logo.png';


function Topo() {

  const usuario = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem('user');
    window.location.href = "/"; // redireciona para a página de login
  };

  
    return (

  <div className="topo">
    <div className="logo-enkartes"><img src={Logo} width="120px" alt="Logo" /></div>
    
    
  <div className="menu-direita">
    {(!usuario || usuario.plano === 'free') && (
   <Link to="/premium" className="btn btn-amarelo"><i className="fa-solid fa-crown"></i> Seja premium</Link>
   )}

    

     <div className="links">
     
      {usuario ? (<>
        <Link to="/"><i class="fa-solid fa-house"></i> Início</Link>
         {(usuario.nivel === 'admin' || usuario.nivel === 'design')   &&(
         <Link to="/admin"><i className="fa-solid fa-gear"></i> Admin</Link>
      )}
        <button className="botaoUser"> {usuario.inicial}</button>
        <Link onClick={logout}>Sair</Link></>
      ) :
      (<>
      <Link to="/entrar">Entrar</Link>
      <Link className="ocultarmobile" to="/cadastrar">Cadastrar</Link>
      </> )}


     
      </div>
      
    </div>

  </div>

    )
}

export default Topo;
