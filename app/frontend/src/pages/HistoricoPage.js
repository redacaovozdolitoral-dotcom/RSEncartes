
Action: file_editor create /app/frontend/src/pages/HistoricoPage.js --file-text "import { useState, useEffect } from \"react\";
import { Link, useNavigate } from \"react-router-dom\";
import { useAuth, API, NeonBackground } from \"../App\";
import axios from \"axios\";
import { toast } from \"sonner\";
import { 
  LayoutDashboard, FileText, Package, History, LogOut, 
  Plus, Download, Trash2, X, Menu, Calendar, Eye
} from \"lucide-react\";

const Sidebar = ({ onLogout }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const menuItems = [
    { id: \"dashboard\", label: \"Dashboard\", icon: <LayoutDashboard size={20} />, path: \"/dashboard\" },
    { id: \"editor\", label: \"Criar Encarte\", icon: <Plus size={20} />, path: \"/editor\" },
    { id: \"produtos\", label: \"Produtos\", icon: <Package size={20} />, path: \"/produtos\" },
    { id: \"historico\", label: \"Histórico\", icon: <History size={20} />, path: \"/historico\" },
  ];

  const SidebarContent = () => (
    <>
      <div className=\"p-6 border-b border-[#00ff41]/20\">
        <Link to=\"/\" className=\"logo-neon text-xl font-bold\">RSEncartes</Link>
      </div>
      <nav className=\"p-4 space-y-2\">
        {menuItems.map(item => (
          <Link
            key={item.id}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 transition-all ${
              item.id === \"historico\" 
                ? \"bg-[#00ff41]/10 text-[#00ff41] border-l-2 border-[#00ff41]\" 
                : \"text-gray-400 hover:text-white hover:bg-white/5\"
            }`}
            onClick={() => setMobileOpen(false)}
          >
            {item.icon}
            <span className=\"font-rajdhani\">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className=\"absolute bottom-0 left-0 right-0 p-4 border-t border-white/10\">
        <button
          onClick={onLogout}
          className=\"flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-[#ff0040] transition-colors w-full\"
        >
          <LogOut size={20} />
          <span className=\"font-rajdhani\">Sair</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className=\"lg:hidden fixed top-0 left-0 right-0 z-50 bg-black border-b border-[#00ff41]/20 px-4 py-3 flex items-center justify-between\">
        <Link to=\"/\" className=\"logo-neon text-xl font-bold\">RSEncartes</Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className=\"text-white\">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {mobileOpen && (
        <div className=\"lg:hidden fixed inset-0 z-40 bg-black/95\">
          <div className=\"pt-16 h-full relative\">
            <SidebarContent />
          </div>
        </div>
      )}
      <aside className=\"hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-[#050505] border-r border-[#00ff41]/20 z-40\">
        <SidebarContent />
      </aside>
    </>
  );
};

export default function HistoricoPage() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [encartes, setEncartes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEncarte, setSelectedEncarte] = useState(null);

  const fetchEncartes = async () => {
    try {
      const response = await axios.get(`${API}/encartes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEncartes(response.data);
    } catch (error) {
      console.error(\"Error fetching encartes:\", error);
      toast.error(\"Erro ao carregar histórico\");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEncartes();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate(\"/\");
  };

  const handleDelete = async (encarteId) => {
    if (!window.confirm(\"Tem certeza que deseja excluir este encarte?\")) return;
    
    try {
      await axios.delete(`${API}/encartes/${encarteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(\"Encarte excluído com sucesso!\");
      fetchEncartes();
    } catch (error) {
      console.error(\"Error deleting encarte:\", error);
      toast.error(\"Erro ao excluir encarte\");
    }
  };

  return (
    <div className=\"min-h-screen relative\">
      <NeonBackground />
      <Sidebar onLogout={handleLogout} />
      
      <main className=\"lg:ml-64 pt-16 lg:pt-0 min-h-screen relative z-10\">
        <div className=\"p-6 lg:p-8\">
          {/* Header */}
          <div className=\"flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8\">
            <div>
              <p className=\"text-[#00ff41] font-orbitron text-xs tracking-[0.2em] uppercase mb-2\">Histórico</p>
              <h1 className=\"text-2xl lg:text-3xl font-orbitron font-bold text-white\">Encartes Gerados</h1>
            </div>
            <Link
              to=\"/editor\"
              className=\"btn-neon px-6 py-3 flex items-center gap-2\"
              data-testid=\"create-encarte-btn\"
            >
              <Plus size={18} />
              Novo Encarte
            </Link>
          </div>

          {/* Encartes Grid */}
          {loading ? (
            <div className=\"flex justify-center py-20\">
              <div className=\"spinner-neon\"></div>
            </div>
          ) : encartes.length > 0 ? (
            <div className=\"grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6\">
              {encartes.map(encarte => (
                <div 
                  key={encarte.id} 
                  className=\"encarte-item overflow-hidden\"
                  data-testid={`encarte-item-${encarte.id}`}
                >
                  {/* Preview Image */}
                  <div 
                    className=\"aspect-[9/16] bg-[#0a0a0a] relative cursor-pointer group\"
                    onClick={() => setSelectedEncarte(encarte)}
                  >
                    <img 
                      src={`${process.env.REACT_APP_BACKEND_URL}${encarte.arquivo_url}`}
                      alt={encarte.titulo}
                      className=\"w-full h-full object-contain\"
                    />
                    <div className=\"absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center\">
                      <Eye className=\"text-white\" size={32} />
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className=\"p-4\">
                    <h3 className=\"text-white font-medium truncate mb-2\">{encarte.titulo}</h3>
                    <div className=\"flex items-center gap-2 text-gray-400 text-sm mb-4\">
                      <Calendar size={14} />
                      {new Date(encarte.criado_em).toLocaleDateString(\"pt-BR\", {
                        day: \"2-digit\",
                        month: \"short\",
                        year: \"numeric\"
                      })}
                    </div>
                    
                    {/* Actions */}
                    <div className=\"flex gap-2\">
                      <a
                        href={`${process.env.REACT_APP_BACKEND_URL}${encarte.arquivo_url}`}
                        download
                        target=\"_blank\"
                        rel=\"noopener noreferrer\"
                        className=\"flex-1 py-2 border border-[#00ff41] text-[#00ff41] flex items-center justify-center gap-2 hover:bg-[#00ff41] hover:text-black transition-all text-sm\"
                        data-testid={`download-encarte-${encarte.id}`}
                      >
                        <Download size={16} />
                        Download
                      </a>
                      <button
                        onClick={() => handleDelete(encarte.id)}
                        className=\"p-2 border border-[#ff0040] text-[#ff0040] hover:bg-[#ff0040] hover:text-white transition-all\"
                        data-testid={`delete-encarte-${encarte.id}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className=\"card-neon\">
              <div className=\"empty-state py-16\">
                <FileText className=\"mx-auto text-gray-600 mb-4\" size={64} />
                <h3 className=\"text-white text-lg mb-2\">Nenhum encarte encontrado</h3>
                <p className=\"text-gray-400 mb-4\">Comece criando seu primeiro encarte promocional</p>
                <Link to=\"/editor\" className=\"btn-neon px-6 py-2 inline-flex items-center gap-2\">
                  <Plus size={18} />
                  Criar Encarte
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Preview Modal */}
      {selectedEncarte && (
        <div className=\"fixed inset-0 z-50 flex items-center justify-center p-4\">
          <div className=\"absolute inset-0 bg-black/95\" onClick={() => setSelectedEncarte(null)}></div>
          <div className=\"relative z-10 max-w-2xl w-full max-h-[90vh] overflow-auto\">
            <button
              onClick={() => setSelectedEncarte(null)}
              className=\"absolute top-4 right-4 text-white hover:text-[#ff0040] transition-colors z-10\"
            >
              <X size={32} />
            </button>
            <img 
              src={`${process.env.REACT_APP_BACKEND_URL}${selectedEncarte.arquivo_url}`}
              alt={selectedEncarte.titulo}
              className=\"w-full h-auto\"
            />
            <div className=\"bg-[#050505] p-4 border-t border-[#00ff41]/20 flex items-center justify-between\">
              <div>
                <h3 className=\"text-white font-orbitron\">{selectedEncarte.titulo}</h3>
                <p className=\"text-gray-400 text-sm\">
                  {new Date(selectedEncarte.criado_em).toLocaleDateString(\"pt-BR\")}
                </p>
              </div>
              <a
                href={`${process.env.REACT_APP_BACKEND_URL}${selectedEncarte.arquivo_url}`}
                download
                target=\"_blank\"
                rel=\"noopener noreferrer\"
                className=\"btn-neon px-6 py-2 flex items-center gap-2\"
              >
                <Download size={18} />
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/pages/HistoricoPage.js
