
Action: file_editor create /app/frontend/src/pages/ProdutosPage.js --file-text "import { useState, useEffect } from \"react\";
import { Link, useNavigate } from \"react-router-dom\";
import { useAuth, API, NeonBackground } from \"../App\";
import axios from \"axios\";
import { toast } from \"sonner\";
import { 
  LayoutDashboard, FileText, Package, History, LogOut, 
  Plus, Edit2, Trash2, X, Menu, Upload, Search
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
              item.id === \"produtos\" 
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

const ProdutoModal = ({ produto, onClose, onSave }) => {
  const [nome, setNome] = useState(produto?.nome || \"\");
  const [preco, setPreco] = useState(produto?.preco?.toString() || \"\");
  const [categoria, setCategoria] = useState(produto?.categoria || \"Mercearia\");
  const [estoque, setEstoque] = useState(produto?.estoque?.toString() || \"0\");
  const [validade, setValidade] = useState(produto?.validade || \"\");
  const [imagem, setImagem] = useState(null);
  const [preview, setPreview] = useState(produto?.img_url ? `${process.env.REACT_APP_BACKEND_URL}${produto.img_url}` : null);
  const [loading, setLoading] = useState(false);

  const categorias = [\"Mercearia\", \"Hortifruti\", \"Carnes\", \"Laticínios\", \"Bebidas\", \"Limpeza\", \"Higiene\", \"Padaria\", \"Congelados\", \"Outros\"];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagem(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome || !preco || !categoria) {
      toast.error(\"Preencha os campos obrigatórios\");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append(\"nome\", nome);
    formData.append(\"preco\", parseFloat(preco));
    formData.append(\"categoria\", categoria);
    formData.append(\"estoque\", parseInt(estoque) || 0);
    formData.append(\"validade\", validade || \"\");
    if (imagem) {
      formData.append(\"imagem\", imagem);
    }

    try {
      await onSave(formData, produto?.id);
      onClose();
    } catch (error) {
      console.error(\"Error saving produto:\", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=\"fixed inset-0 z-50 flex items-center justify-center p-4\">
      <div className=\"absolute inset-0 bg-black/90\" onClick={onClose}></div>
      <div className=\"auth-form p-6 w-full max-w-lg relative z-10 max-h-[90vh] overflow-y-auto\">
        <div className=\"flex items-center justify-between mb-6\">
          <h2 className=\"font-orbitron text-xl text-white\">
            {produto ? \"Editar Produto\" : \"Novo Produto\"}
          </h2>
          <button onClick={onClose} className=\"text-gray-400 hover:text-white\">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className=\"space-y-4\">
          {/* Image Upload */}
          <div>
            <label className=\"block text-sm font-orbitron text-[#00ff41] mb-2 uppercase tracking-wider\">
              Imagem
            </label>
            <div 
              className=\"border-2 border-dashed border-white/20 p-4 text-center cursor-pointer hover:border-[#00ff41]/50 transition-colors\"
              onClick={() => document.getElementById(\"produto-imagem\").click()}
            >
              {preview ? (
                <img src={preview} alt=\"Preview\" className=\"max-h-40 mx-auto object-contain\" />
              ) : (
                <div className=\"py-8\">
                  <Upload className=\"mx-auto text-gray-500 mb-2\" size={32} />
                  <p className=\"text-gray-400 text-sm\">Clique para adicionar imagem</p>
                </div>
              )}
            </div>
            <input
              type=\"file\"
              id=\"produto-imagem\"
              accept=\"image/*\"
              onChange={handleImageChange}
              className=\"hidden\"
            />
          </div>

          {/* Nome */}
          <div>
            <label className=\"block text-sm font-orbitron text-[#00ff41] mb-2 uppercase tracking-wider\">
              Nome *
            </label>
            <input
              type=\"text\"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className=\"input-neon w-full px-4 py-3\"
              placeholder=\"Nome do produto\"
              data-testid=\"produto-nome-input\"
            />
          </div>

          {/* Preço */}
          <div>
            <label className=\"block text-sm font-orbitron text-[#00ff41] mb-2 uppercase tracking-wider\">
              Preço *
            </label>
            <input
              type=\"number\"
              step=\"0.01\"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              className=\"input-neon w-full px-4 py-3\"
              placeholder=\"0.00\"
              data-testid=\"produto-preco-input\"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className=\"block text-sm font-orbitron text-[#00ff41] mb-2 uppercase tracking-wider\">
              Categoria *
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className=\"input-neon w-full px-4 py-3 bg-transparent\"
              data-testid=\"produto-categoria-select\"
            >
              {categorias.map(cat => (
                <option key={cat} value={cat} className=\"bg-black\">{cat}</option>
              ))}
            </select>
          </div>

          {/* Estoque */}
          <div>
            <label className=\"block text-sm font-orbitron text-[#00ff41] mb-2 uppercase tracking-wider\">
              Estoque
            </label>
            <input
              type=\"number\"
              value={estoque}
              onChange={(e) => setEstoque(e.target.value)}
              className=\"input-neon w-full px-4 py-3\"
              placeholder=\"0\"
              data-testid=\"produto-estoque-input\"
            />
          </div>

          {/* Validade */}
          <div>
            <label className=\"block text-sm font-orbitron text-[#00ff41] mb-2 uppercase tracking-wider\">
              Validade
            </label>
            <input
              type=\"date\"
              value={validade}
              onChange={(e) => setValidade(e.target.value)}
              className=\"input-neon w-full px-4 py-3\"
              data-testid=\"produto-validade-input\"
            />
          </div>

          <button
            type=\"submit\"
            disabled={loading}
            className=\"btn-neon w-full py-3 mt-6 flex items-center justify-center gap-2\"
            data-testid=\"produto-submit-btn\"
          >
            {loading ? (
              <div className=\"spinner-neon w-5 h-5 border-2\"></div>
            ) : (
              produto ? \"Salvar Alterações\" : \"Cadastrar Produto\"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default function ProdutosPage() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [searchTerm, setSearchTerm] = useState(\"\");
  const [filterCategoria, setFilterCategoria] = useState(\"\");

  const fetchProdutos = async () => {
    try {
      const response = await axios.get(`${API}/produtos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProdutos(response.data);
    } catch (error) {
      console.error(\"Error fetching produtos:\", error);
      toast.error(\"Erro ao carregar produtos\");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate(\"/\");
  };

  const handleSave = async (formData, produtoId) => {
    try {
      if (produtoId) {
        await axios.put(`${API}/produtos/${produtoId}`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            \"Content-Type\": \"multipart/form-data\"
          }
        });
        toast.success(\"Produto atualizado com sucesso!\");
      } else {
        await axios.post(`${API}/produtos`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            \"Content-Type\": \"multipart/form-data\"
          }
        });
        toast.success(\"Produto cadastrado com sucesso!\");
      }
      fetchProdutos();
    } catch (error) {
      console.error(\"Error saving produto:\", error);
      toast.error(error.response?.data?.detail || \"Erro ao salvar produto\");
      throw error;
    }
  };

  const handleDelete = async (produtoId) => {
    if (!window.confirm(\"Tem certeza que deseja excluir este produto?\")) return;
    
    try {
      await axios.delete(`${API}/produtos/${produtoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(\"Produto excluído com sucesso!\");
      fetchProdutos();
    } catch (error) {
      console.error(\"Error deleting produto:\", error);
      toast.error(\"Erro ao excluir produto\");
    }
  };

  const openEditModal = (produto) => {
    setEditingProduto(produto);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduto(null);
  };

  const filteredProdutos = produtos.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = !filterCategoria || p.categoria === filterCategoria;
    return matchesSearch && matchesCategoria;
  });

  const categorias = [...new Set(produtos.map(p => p.categoria))];

  return (
    <div className=\"min-h-screen relative\">
      <NeonBackground />
      <Sidebar onLogout={handleLogout} />
      
      <main className=\"lg:ml-64 pt-16 lg:pt-0 min-h-screen relative z-10\">
        <div className=\"p-6 lg:p-8\">
          {/* Header */}
          <div className=\"flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8\">
            <div>
              <p className=\"text-[#00ff41] font-orbitron text-xs tracking-[0.2em] uppercase mb-2\">Gerenciamento</p>
              <h1 className=\"text-2xl lg:text-3xl font-orbitron font-bold text-white\">Produtos</h1>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className=\"btn-neon px-6 py-3 flex items-center gap-2\"
              data-testid=\"add-produto-btn\"
            >
              <Plus size={18} />
              Novo Produto
            </button>
          </div>

          {/* Filters */}
          <div className=\"card-neon p-4 mb-6\">
            <div className=\"flex flex-col sm:flex-row gap-4\">
              <div className=\"relative flex-1\">
                <Search className=\"absolute left-4 top-1/2 -translate-y-1/2 text-gray-400\" size={18} />
                <input
                  type=\"text\"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder=\"Buscar produto...\"
                  className=\"input-neon w-full pl-12 pr-4 py-2\"
                  data-testid=\"search-input\"
                />
              </div>
              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className=\"input-neon px-4 py-2 bg-transparent\"
                data-testid=\"filter-categoria\"
              >
                <option value=\"\" className=\"bg-black\">Todas categorias</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat} className=\"bg-black\">{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Table/Grid */}
          {loading ? (
            <div className=\"flex justify-center py-20\">
              <div className=\"spinner-neon\"></div>
            </div>
          ) : filteredProdutos.length > 0 ? (
            <div className=\"card-neon overflow-hidden\">
              <div className=\"overflow-x-auto\">
                <table className=\"table-neon\">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Categoria</th>
                      <th>Preço</th>
                      <th>Estoque</th>
                      <th className=\"text-right\">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProdutos.map(produto => (
                      <tr key={produto.id} data-testid={`produto-row-${produto.id}`}>
                        <td>
                          <div className=\"flex items-center gap-3\">
                            <div className=\"w-12 h-12 bg-[#0a0a0a] border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0\">
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
                            <span className=\"text-white\">{produto.nome}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`category-badge ${produto.categoria.toLowerCase().replace(/\s+/g, '-')}`}>
                            {produto.categoria}
                          </span>
                        </td>
                        <td className=\"text-[#ffed00] font-bold\">
                          R$ {produto.preco.toFixed(2).replace(\".\", \",\")}
                        </td>
                        <td className=\"text-gray-400\">{produto.estoque}</td>
                        <td>
                          <div className=\"flex items-center justify-end gap-2\">
                            <button
                              onClick={() => openEditModal(produto)}
                              className=\"p-2 text-[#00d4ff] hover:bg-[#00d4ff]/10 transition-colors\"
                              data-testid={`edit-produto-${produto.id}`}
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(produto.id)}
                              className=\"p-2 text-[#ff0040] hover:bg-[#ff0040]/10 transition-colors\"
                              data-testid={`delete-produto-${produto.id}`}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className=\"card-neon\">
              <div className=\"empty-state py-16\">
                <Package className=\"mx-auto text-gray-600 mb-4\" size={64} />
                <h3 className=\"text-white text-lg mb-2\">Nenhum produto encontrado</h3>
                <p className=\"text-gray-400 mb-4\">
                  {searchTerm || filterCategoria 
                    ? \"Tente ajustar os filtros\" 
                    : \"Comece cadastrando seus produtos\"}
                </p>
                {!searchTerm && !filterCategoria && (
                  <button
                    onClick={() => setModalOpen(true)}
                    className=\"btn-neon px-6 py-2\"
                  >
                    Cadastrar Produto
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {modalOpen && (
        <ProdutoModal
          produto={editingProduto}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/pages/ProdutosPage.js
