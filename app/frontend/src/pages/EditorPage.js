
Action: file_editor create /app/frontend/src/pages/EditorPage.js --file-text "import { useState, useEffect, useRef } from \"react\";
import { Link, useNavigate } from \"react-router-dom\";
import { useAuth, API, NeonBackground } from \"../App\";
import axios from \"axios\";
import { toast } from \"sonner\";
import { 
  LayoutDashboard, FileText, Package, History, LogOut, 
  Plus, ChevronLeft, Download, Check, X, Menu, Trash2
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
              item.id === \"editor\" 
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

export default function EditorPage() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedProdutos, setSelectedProdutos] = useState([]);
  const [titulo, setTitulo] = useState(\"Ofertas da Semana\");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedEncarte, setGeneratedEncarte] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [templatesRes, produtosRes] = await Promise.all([
          axios.get(`${API}/templates`),
          axios.get(`${API}/produtos`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setTemplates(templatesRes.data);
        setProdutos(produtosRes.data);
        if (templatesRes.data.length > 0) {
          setSelectedTemplate(templatesRes.data[0]);
        }
      } catch (error) {
        console.error(\"Error fetching data:\", error);
        toast.error(\"Erro ao carregar dados\");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate(\"/\");
  };

  const toggleProduto = (produto) => {
    const maxProdutos = selectedTemplate?.config_json?.positions?.length || 6;
    if (selectedProdutos.find(p => p.id === produto.id)) {
      setSelectedProdutos(selectedProdutos.filter(p => p.id !== produto.id));
    } else if (selectedProdutos.length < maxProdutos) {
      setSelectedProdutos([...selectedProdutos, produto]);
    } else {
      toast.warning(`Máximo de ${maxProdutos} produtos para este template`);
    }
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) {
      toast.error(\"Selecione um template\");
      return;
    }
    if (selectedProdutos.length === 0) {
      toast.error(\"Selecione pelo menos um produto\");
      return;
    }

    setGenerating(true);
    try {
      const response = await axios.post(
        `${API}/encartes/gerar`,
        {
          template_id: selectedTemplate.id,
          produtos_ids: selectedProdutos.map(p => p.id),
          titulo
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGeneratedEncarte(response.data);
      toast.success(\"Encarte gerado com sucesso!\");
    } catch (error) {
      console.error(\"Error generating encarte:\", error);
      toast.error(error.response?.data?.detail || \"Erro ao gerar encarte\");
    } finally {
      setGenerating(false);
    }
  };

  const getTemplateColor = (template) => {
    const colors = {
      \"Supermercado\": \"#00ff41\",
      \"Hortifruti\": \"#00ff41\",
      \"Farmácia\": \"#00d4ff\",
      \"Atacadista\": \"#ff0040\",
      \"Geral\": \"#ffed00\"
    };
    return colors[template?.categoria] || \"#00ff41\";
  };

  return (
    <div className=\"min-h-screen relative\">
      <NeonBackground />
      <Sidebar onLogout={handleLogout} />
      
      <main className=\"lg:ml-64 pt-16 lg:pt-0 min-h-screen relative z-10\">
        <div className=\"p-4 lg:p-6\">
          {/* Header */}
          <div className=\"flex items-center justify-between mb-6\">
            <div>
              <p className=\"text-[#00ff41] font-orbitron text-xs tracking-[0.2em] uppercase mb-1\">Editor</p>
              <h1 className=\"text-xl lg:text-2xl font-orbitron font-bold text-white\">Criar Encarte</h1>
            </div>
            <Link 
              to=\"/dashboard\" 
              className=\"flex items-center gap-2 text-gray-400 hover:text-white transition-colors\"
            >
              <ChevronLeft size={18} />
              Voltar
            </Link>
          </div>

          {loading ? (
            <div className=\"flex justify-center py-20\">
              <div className=\"spinner-neon\"></div>
            </div>
          ) : (
            <div className=\"grid lg:grid-cols-12 gap-6\">
              {/* Templates Sidebar */}
              <div className=\"lg:col-span-3\">
                <div className=\"card-neon p-4 mb-4\">
                  <h3 className=\"font-orbitron text-sm text-[#00ff41] mb-4 uppercase tracking-wider\">Templates</h3>
                  <div className=\"space-y-3\">
                    {templates.map(template => (
                      <div
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                        className={`template-preview p-3 cursor-pointer ${
                          selectedTemplate?.id === template.id ? \"selected\" : \"\"
                        }`}
                        data-testid={`template-${template.id}`}
                      >
                        <div 
                          className=\"h-full flex flex-col items-center justify-center\"
                          style={{ borderColor: getTemplateColor(template) }}
                        >
                          <FileText size={32} style={{ color: getTemplateColor(template) }} />
                          <p className=\"text-white text-sm mt-2 text-center\">{template.nome}</p>
                          <span className={`category-badge ${template.categoria.toLowerCase()} mt-2`}>
                            {template.categoria}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Canvas Preview */}
              <div className=\"lg:col-span-5\">
                <div className=\"card-neon p-4\">
                  <h3 className=\"font-orbitron text-sm text-[#00d4ff] mb-4 uppercase tracking-wider\">Preview</h3>
                  
                  {/* Title Input */}
                  <div className=\"mb-4\">
                    <input
                      type=\"text\"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      className=\"input-neon w-full px-4 py-2 text-center font-orbitron\"
                      placeholder=\"Título do Encarte\"
                      data-testid=\"encarte-titulo-input\"
                    />
                  </div>

                  {/* Canvas Preview */}
                  <div 
                    ref={canvasRef}
                    className=\"canvas-preview-container mx-auto\"
                    style={{ borderColor: getTemplateColor(selectedTemplate) }}
                  >
                    {generatedEncarte ? (
                      <img 
                        src={`${process.env.REACT_APP_BACKEND_URL}${generatedEncarte.arquivo_url}`}
                        alt=\"Encarte gerado\"
                        className=\"w-full h-full object-contain\"
                      />
                    ) : (
                      <div className=\"p-4 h-full flex flex-col\">
                        <h4 
                          className=\"font-orbitron text-center text-sm mb-4\"
                          style={{ color: getTemplateColor(selectedTemplate) }}
                        >
                          {titulo.toUpperCase()}
                        </h4>
                        <div className={`grid gap-2 flex-1 ${
                          selectedProdutos.length <= 4 ? \"grid-cols-2\" : \"grid-cols-3\"
                        }`}>
                          {selectedProdutos.map((produto, i) => (
                            <div 
                              key={produto.id}
                              className=\"bg-[#0a0a0a] border border-[#00ff41]/20 p-2 flex flex-col\"
                            >
                              <div className=\"bg-[#1a1a1a] flex-1 mb-1 flex items-center justify-center overflow-hidden\">
                                {produto.img_url ? (
                                  <img 
                                    src={`${process.env.REACT_APP_BACKEND_URL}${produto.img_url}`}
                                    alt={produto.nome}
                                    className=\"w-full h-full object-cover\"
                                  />
                                ) : (
                                  <Package className=\"text-gray-600\" size={24} />
                                )}
                              </div>
                              <p className=\"text-white text-[10px] truncate\">{produto.nome}</p>
                              <p className=\"text-[#ffed00] font-bold text-xs\">
                                R$ {produto.preco.toFixed(2).replace(\".\", \",\")}
                              </p>
                            </div>
                          ))}
                          {selectedProdutos.length === 0 && (
                            <div className=\"col-span-full flex items-center justify-center text-gray-500 text-sm\">
                              Selecione produtos à direita
                            </div>
                          )}
                        </div>
                        <p 
                          className=\"text-center text-[8px] mt-2 font-orbitron\"
                          style={{ color: getTemplateColor(selectedTemplate), opacity: 0.5 }}
                        >
                          RSEncartes Neon
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className=\"mt-4 flex gap-3\">
                    <button
                      onClick={handleGenerate}
                      disabled={generating || selectedProdutos.length === 0}
                      className=\"btn-neon flex-1 py-3 flex items-center justify-center gap-2\"
                      data-testid=\"generate-encarte-btn\"
                    >
                      {generating ? (
                        <div className=\"spinner-neon w-5 h-5 border-2\"></div>
                      ) : (
                        <>
                          <FileText size={18} />
                          Gerar Encarte
                        </>
                      )}
                    </button>
                    {generatedEncarte && (
                      <a
                        href={`${process.env.REACT_APP_BACKEND_URL}${generatedEncarte.arquivo_url}`}
                        download
                        target=\"_blank\"
                        rel=\"noopener noreferrer\"
                        className=\"px-4 py-3 border-2 border-[#00d4ff] text-[#00d4ff] flex items-center gap-2 hover:bg-[#00d4ff] hover:text-black transition-all\"
                        data-testid=\"download-encarte-btn\"
                      >
                        <Download size={18} />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Produtos Sidebar */}
              <div className=\"lg:col-span-4\">
                <div className=\"card-neon p-4\">
                  <div className=\"flex items-center justify-between mb-4\">
                    <h3 className=\"font-orbitron text-sm text-[#ffed00] uppercase tracking-wider\">
                      Produtos ({selectedProdutos.length}/{selectedTemplate?.config_json?.positions?.length || 6})
                    </h3>
                    {selectedProdutos.length > 0 && (
                      <button
                        onClick={() => setSelectedProdutos([])}
                        className=\"text-gray-400 hover:text-[#ff0040] transition-colors\"
                        data-testid=\"clear-selection-btn\"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  
                  {produtos.length > 0 ? (
                    <div className=\"space-y-2 max-h-[500px] overflow-y-auto pr-2\">
                      {produtos.map(produto => {
                        const isSelected = selectedProdutos.find(p => p.id === produto.id);
                        return (
                          <div
                            key={produto.id}
                            onClick={() => toggleProduto(produto)}
                            className={`product-item p-3 flex items-center gap-3 ${isSelected ? \"selected\" : \"\"}`}
                            data-testid={`produto-item-${produto.id}`}
                          >
                            <div className=\"w-12 h-12 bg-[#1a1a1a] border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0\">
                              {produto.img_url ? (
                                <img 
                                  src={`${process.env.REACT_APP_BACKEND_URL}${produto.img_url}`}
                                  alt={produto.nome}
                                  className=\"w-full h-full object-cover\"
                                />
                              ) : (
                                <Package className=\"text-gray-600\" size={20} />
                              )}
                            </div>
                            <div className=\"flex-1 min-w-0\">
                              <p className=\"text-white text-sm truncate\">{produto.nome}</p>
                              <p className=\"text-[#ffed00] font-bold\">
                                R$ {produto.preco.toFixed(2).replace(\".\", \",\")}
                              </p>
                            </div>
                            <div className={`w-6 h-6 border flex items-center justify-center flex-shrink-0 ${
                              isSelected ? \"border-[#00ff41] bg-[#00ff41]\" : \"border-white/20\"
                            }`}>
                              {isSelected && <Check size={14} className=\"text-black\" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className=\"empty-state py-8\">
                      <Package className=\"mx-auto text-gray-600 mb-3\" size={40} />
                      <p className=\"text-gray-400 text-sm mb-2\">Nenhum produto cadastrado</p>
                      <Link to=\"/produtos\" className=\"text-[#00ff41] hover:underline text-sm\">
                        Cadastrar produtos
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/pages/EditorPage.js
