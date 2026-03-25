
Action: file_editor create /app/frontend/src/pages/LoginPage.js --file-text "import { useState } from \"react\";
import { Link, useNavigate } from \"react-router-dom\";
import { useAuth, NeonBackground } from \"../App\";
import { toast } from \"sonner\";
import { Eye, EyeOff, ArrowLeft } from \"lucide-react\";

export default function LoginPage() {
  const [email, setEmail] = useState(\"\");
  const [senha, setSenha] = useState(\"\");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !senha) {
      toast.error(\"Preencha todos os campos\");
      return;
    }
    setLoading(true);
    try {
      await login(email, senha);
      toast.success(\"Login realizado com sucesso!\");
      navigate(\"/dashboard\");
    } catch (error) {
      const message = error.response?.data?.detail || \"Erro ao fazer login\";
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
            <p className=\"text-gray-400\">Entre na sua conta</p>
          </div>

          <form onSubmit={handleSubmit} className=\"space-y-6\">
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
                data-testid=\"login-email-input\"
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
                  data-testid=\"login-password-input\"
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

            <button
              type=\"submit\"
              disabled={loading}
              className=\"btn-neon w-full py-3 flex items-center justify-center gap-2\"
              data-testid=\"login-submit-btn\"
            >
              {loading ? (
                <div className=\"spinner-neon w-5 h-5 border-2\"></div>
              ) : (
                \"Entrar\"
              )}
            </button>
          </form>

          <p className=\"text-center text-gray-400 mt-6\">
            Não tem conta?{\" \"}
            <Link to=\"/register\" className=\"text-[#00ff41] hover:underline\" data-testid=\"register-link\">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/pages/LoginPage.js
