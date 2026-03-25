
Action: file_editor create /app/frontend/src/pages/DashboardPage.js --file-text "import { useState, useEffect } from \"react\";
import { Link, useNavigate } from \"react-router-dom\";
import { useAuth, API, NeonBackground } from \"../App\";
import axios from \"axios\";
import { toast } from \"sonner\";
import { 
  LayoutDashboard, FileText, Package, History, LogOut, 
  Plus, Layers, Clock, Menu, X 
} from \"lucide-react\";

const Sidebar = ({ activeItem, onLogout }) => {
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
        <Link to=\"/\" className=\"logo-neon text-xl font-bold\" data-testid=\"sidebar-logo\">RSEncartes</Link>
      </div>
      <nav className=\"p-4 space-y-2\">
        {menuItems.map(item => (
          <Link
            key={item.id}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 transition-all ${
              activeItem === item.id 
                ? \"bg-[#00ff41]/10 text-[#00ff41] border-l-2 border-[#00ff41]\" 
                : \"text-gray-400 hover:text-white hover:bg-white/5\"
            }`}
            data-testid={`sidebar-${item.id}`}
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
          data-testid=\"sidebar-logout\"
        >
          <LogOut size={20} />
          <span className=\"font-rajdhani\">Sair</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className=\"lg:hidden fixed top-0 left-0 right-0 z-50 bg-black border-b border-[#00ff41]/20 px-4 py-3 flex items-center justify-between\">
        <Link to=\"/\" className=\"logo-neon text-xl font-bold\">RSEncartes</Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className=\"text-white\">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className=\"lg:hidden fixed inset-0 z-40 bg-black/95\">
          <div className=\"pt-16 h-full relative\">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className=\"hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-[#050505] border-r border-[#00ff41]/20 z-40\">
        <SidebarContent />
      </aside>
    </>
  );
};

export default function DashboardPage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ produtos: 0, encartes: 0, plano: \"free\" });
  const [recentEncartes, setRecentEncartes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, encartesRes] = await Promise.all([
          axios.get(`${API}/stats`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/encartes`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setStats(statsRes.data);
        setRecentEncartes(encartesRes.data.slice(0, 5));
      } catch (error) {
        console.error(\"Error fetching data:\", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate(\"/\");
    toast.success(\"Logout realizado com sucesso!\");
  };

  return (
    <div className=\"min-h-screen relative\">
      <NeonBackground />
      <Sidebar activeItem=\"dashboard\" onLogout={handleLogout} />
      
      <main className=\"lg:ml-64 pt-16 lg:pt-0 min-h-screen relative z-10\">
        <div className=\"p-6 lg:p-8\">
          {/* Header */}
          <div className=\"mb-8\">
            <p className=\"text-[#00ff41] font-orbitron text-xs tracking-[0.2em] uppercase mb-2\">Dashboard</p>
            <h1 className=\"text-2xl lg:text-3xl font-orbitron font-bold text-white\">
              Olá, {user?.nome || \"Usuário\"}
            </h1>
          </div>

          {/* Stats Cards */}
          <div className=\"grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8\">
            <div className=\"stat-card p-6\" data-testid=\"stat-produtos\">
              <div className=\"flex items-center justify-between mb-2\">
                <Package className=\"text-[#00ff41]\" size={24} />
                <span className=\"text-3xl font-bold text-white\">{stats.produtos}</span>
              </div>
              <p className=\"text-gray-400 text-sm\">Produtos cadastrados</p>
            </div>
            <div className=\"stat-card p-6\" data-testid=\"stat-encartes\">
              <div className=\"flex items-center justify-between mb-2\">
                <FileText className=\"text-[#00d4ff]\" size={24} />
                <span className=\"text-3xl font-bold text-white\">{stats.encartes}</span>
              </div>
              <p className=\"text-gray-400 text-sm\">Encartes gerados</p>
            </div>
            <div className=\"stat-card p-6\" data-testid=\"stat-templates\">
              <div className=\"flex items-center justify-between mb-2\">
                <Layers className=\"text-[#ff0040]\" size={24} />
                <span className=\"text-3xl font-bold text-white\">5</span>
              </div>
              <p className=\"text-gray-400 text-sm\">Templates disponíveis</p>
            </div>
            <div className=\"stat-card p-6\" data-testid=\"stat-plano\">
              <div className=\"flex items-center justify-between mb-2\">
                <Clock className=\"text-[#ffed00]\" size={24} />
                <span className=\"text-xl font-bold text-white uppercase\">{stats.plano}</span>
              </div>
              <p className=\"text-gray-400 text-sm\">Seu plano atual</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className=\"grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8\">
            <Link 
              to=\"/editor\" 
              className=\"card-neon p-6 flex items-center gap-4 hover:border-[#00ff41]\"
              data-testid=\"quick-action-editor\"
            >
              <div className=\"w-12 h-12 bg-[#00ff41]/10 flex items-center justify-center\">
                <Plus className=\"text-[#00ff41]\" size={24} />
              </div>
              <div>
                <h3 className=\"font-orbitron text-white font-bold\">Criar Encarte</h3>
                <p className=\"text-gray-400 text-sm\">Novo encarte promocional</p>
              </div>
            </Link>
            <Link 
              to=\"/produtos\" 
              className=\"card-neon p-6 flex items-center gap-4 hover:border-[#00d4ff]\"
              data-testid=\"quick-action-produtos\"
            >
              <div className=\"w-12 h-12 bg-[#00d4ff]/10 flex items-center justify-center\">
                <Package className=\"text-[#00d4ff]\" size={24} />
              </div>
              <div>
                <h3 className=\"font-orbitron text-white font-bold\">Gerenciar Produtos</h3>
                <p className=\"text-gray-400 text-sm\">Cadastre seus produtos</p>
              </div>
            </Link>
            <Link 
              to=\"/historico\" 
              className=\"card-neon p-6 flex items-center gap-4 hover:border-[#ff0040]\"
              data-testid=\"quick-action-historico\"
            >
              <div className=\"w-12 h-12 bg-[#ff0040]/10 flex items-center justify-center\">
                <History className=\"text-[#ff0040]\" size={24} />
              </div>
              <div>
                <h3 className=\"font-orbitron text-white font-bold\">Ver Histórico</h3>
                <p className=\"text-gray-400 text-sm\">Encartes anteriores</p>
              </div>
            </Link>
          </div>

          {/* Recent Encartes */}
          <div className=\"card-neon p-6\">
            <h2 className=\"font-orbitron text-lg text-white mb-4\">Encartes Recentes</h2>
            {loading ? (
              <div className=\"flex justify-center py-8\">
                <div className=\"spinner-neon\"></div>
              </div>
            ) : recentEncartes.length > 0 ? (
              <div className=\"space-y-3\">
                {recentEncartes.map(encarte => (
                  <div 
                    key={encarte.id} 
                    className=\"encarte-item p-4 flex items-center justify-between\"
                    data-testid={`recent-encarte-${encarte.id}`}
                  >
                    <div className=\"flex items-center gap-4\">
                      <div className=\"w-16 h-24 bg-[#0a0a0a] border border-[#00ff41]/20 flex items-center justify-center\">
                        <FileText className=\"text-[#00ff41]\" size={20} />
                      </div>
                      <div>
                        <h4 className=\"text-white font-medium\">{encarte.titulo}</h4>
                        <p className=\"text-gray-400 text-sm\">
                          {new Date(encarte.criado_em).toLocaleDateString(\"pt-BR\")}
                        </p>
                      </div>
                    </div>
                    <a 
                      href={`${process.env.REACT_APP_BACKEND_URL}${encarte.arquivo_url}`}
                      target=\"_blank\"
                      rel=\"noopener noreferrer\"
                      className=\"text-[#00ff41] hover:underline text-sm\"
                    >
                      Visualizar
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className=\"empty-state\">
                <FileText className=\"mx-auto text-gray-600 mb-4\" size={48} />
                <p>Nenhum encarte criado ainda</p>
                <Link to=\"/editor\" className=\"text-[#00ff41] hover:underline mt-2 inline-block\">
                  Criar primeiro encarte
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/pages/DashboardPage.js
