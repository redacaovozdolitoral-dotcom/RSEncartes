
Action: file_editor create /app/frontend/src/pages/RegisterPage.js --file-text "import { useState } from \"react\";
import { Link, useNavigate } from \"react-router-dom\";
import { useAuth, NeonBackground } from \"../App\";
import { toast } from \"sonner\";
import { Eye, EyeOff, ArrowLeft } from \"lucide-react\";

export default function RegisterPage() {
  const [nome, setNome] = useState(\"\");
  const [email, setEmail] = useState(\"\");
  const [senha, setSenha] = useState(\"\");
  const [confirmSenha, setConfirmSenha] = useState(\"\");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome || !email || !senha || !confirmSenha) {
      toast.error(\"Preencha todos os campos\");
      return;
    }
    if (senha !== confirmSenha) {
      toast.error(\"As senhas não coincidem\");
      return;
    }
    if (senha.length < 6) {
      toast.error(\"A senha deve ter pelo menos 6 caracteres\");
      return;
    }
    setLoading(true);
    try {
      await register(nome, email, senha);
      toast.success(\"Conta criada com sucesso!\");
      navigate(\"/dashboard\");
    } catch (error) {
      const message = error.response?.data?.detail || \"Erro ao criar conta\";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=\"min-h-screen relative flex items-center justify-center px-6 py-12\">
      <NeonBackground />
      <div className=\"relative z-10 w-full max-w-md\">
        <Link 
          to=\"/\" 
          className=\"flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8\"
          data-testid=\"back-link\"
        >
          <ArrowLeft size={18} />
          Voltar
        </Link>
        
        <div className=\"auth-form p-8\">
          <div className=\"text-center mb-8\">
            <h1 className=\"logo-neon text-3xl font-bold mb-2\">RSEncartes</h1>
            <p className=\"text-gray-400\">Crie sua conta grátis</p>
          </div>

          <form onSubmit={handleSubmit} className=\"space-y-5\">
            <div>
              <label className=\"block text-sm font-orbitron text-[#00ff41] mb-2 uppercase tracking-wider\">
                Nome
              </label>
              <input
                type=\"text\"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className=\"input-neon w-full px-4 py-3 rounded-none\"
                placeholder=\"Seu nome\"
                data-testid=\"register-name-input\"
              />
            </div>

            <div>
              <label className=\"block text-sm font-orbitron text-[#00ff41] mb-2 uppercase tracking-wider\">
                Email
              </label>
              <input
                type=\"email\"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className=\"input-neon w-full px-4 py-3 rounded-none\"
                placeholder=\"seu@email.com\"
                data-testid=\"register-email-input\"
              />
            </div>

            <div>
              <label className=\"block text-sm font-orbitron text-[#00ff41] mb-2 uppercase tracking-wider\">
                Senha
              </label>
              <div className=\"relative\">
                <input
                  type={showPassword ? \"text\" : \"password\"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className=\"input-neon w-full px-4 py-3 pr-12 rounded-none\"
                  placeholder=\"••••••••\"
                  data-testid=\"register-password-input\"
                />
                <button
                  type=\"button\"
                  onClick={() => setShowPassword(!showPassword)}
                  className=\"absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors\"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className=\"block text-sm font-orbitron text-[#00ff41] mb-2 uppercase tracking-wider\">
                Confirmar Senha
              </label>
              <input
                type={showPassword ? \"text\" : \"password\"}
                value={confirmSenha}
                onChange={(e) => setConfirmSenha(e.target.value)}
                className=\"input-neon w-full px-4 py-3 rounded-none\"
                placeholder=\"••••••••\"
                data-testid=\"register-confirm-password-input\"
              />
            </div>

            <button
              type=\"submit\"
              disabled={loading}
              className=\"btn-neon w-full py-3 flex items-center justify-center gap-2\"
              data-testid=\"register-submit-btn\"
            >
              {loading ? (
                <div className=\"spinner-neon w-5 h-5 border-2\"></div>
              ) : (
                \"Criar Conta\"
              )}
            </button>
          </form>

          <p className=\"text-center text-gray-400 mt-6\">
            Já tem conta?{\" \"}
            <Link to=\"/login\" className=\"text-[#00ff41] hover:underline\" data-testid=\"login-link\">
              Entre aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/pages/RegisterPage.js
