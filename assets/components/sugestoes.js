import { useState } from 'react';


const Sugestoes = () => {

  const [tema, setTema] = useState('');
  const [texto, setTexto] = useState('');
  const [tipo, setTipo] = useState([]);
  const [enviando, setEnviando] = useState(false);


const user = JSON.parse(localStorage.getItem("user"));
const usuario = user.id;


  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

    const data = {
      tema,
      texto,
      tipo,
      usuario
    };

    try {
      const response = await fetch('https://enkartes.com/api/enviar-sugestao.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const res = await response.json();
      if (res.success) {
        alert('Sugestão enviada com sucesso!');
      } else {
        alert('Erro ao enviar sugestão.');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      alert('Erro de conexão com o servidor.');
    }

    setEnviando(false);
  };


  return (
    <div
      className="modal fade"
      id="sugestoes"
      tabIndex="-1"
      aria-labelledby="modalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
            <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h5 className="modal-title" id="modalLabel">Sugestão de conteúdo</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
           <div className="mb-3">
                <label className="form-label">Tema</label>
                <input
                  type="text"
                  className="form-control"
                  value={tema}
                  onChange={(e) => setTema(e.target.value)}
                  required
                />
              </div>


              <div className="mb-3">
                <label className="form-label">Texto para criação de conteúdo</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  required
                ></textarea>
              </div>


              <div className="mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="tipo"
                  onChange={(e) =>{
                     const value = e.target.value;
                    setTipo(prev =>
                        e.target.checked
                        ? [...prev, value] // adiciona se estiver marcado
                        : prev.filter(cat => cat !== value) // remove se desmarcar
                    );
                    }}  
                    value="Encartes"
                  id="encartes"
                />
                 <label className="form-check-label ms-2 me-2" htmlFor="encartes"> Encartes</label>


                  <input
                  className="form-check-input"
                  type="checkbox"
                  name="tipo"
                  onChange={(e) =>{
                     const value = e.target.value;
                    setTipo(prev =>
                        e.target.checked
                        ? [...prev, value] // adiciona se estiver marcado
                        : prev.filter(cat => cat !== value) // remove se desmarcar
                    );
                    }} 
                 value="Social Media"
                  id="social"
                />
                 <label className="form-check-label ms-2 me-2" htmlFor="social"> Social Media</label>


                  <input
                  className="form-check-input"
                  type="checkbox"
                  name="tipo"
                  onChange={(e) =>{
                     const value = e.target.value;
                    setTipo(prev =>
                        e.target.checked
                        ? [...prev, value] // adiciona se estiver marcado
                        : prev.filter(cat => cat !== value) // remove se desmarcar
                    );
                    }} 
                     value="Outro"
                  id="outro"
                />
                 <label className="form-check-label ms-2" htmlFor="outro"> Outro</label>

                </div>

          </div>

          <div className="modal-footer">
              <button type="submit"  className="botao" disabled={enviando}>
                {enviando ? 'Enviando...' : 'Solicitar'}
              </button>
            </div>

</form>
        </div>
      </div>
    </div>
  );
};

export default Sugestoes;
