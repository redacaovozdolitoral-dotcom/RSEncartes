
Action: file_editor create /app/frontend/src/App.js --file-text "import { useState, useEffect, createContext, useContext } from \"react\";
import \"@/App.css\";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link } from \"react-router-dom\";
import axios from \"axios\";
import { Toaster, toast } from \"sonner\";

// Pages
import LandingPage from \"./pages/LandingPage\";
import LoginPage from \"./pages/LoginPage\";
import RegisterPage from \"./pages/RegisterPage\";
import DashboardPage from \"./pages/DashboardPage\";
import EditorPage from \"./pages/EditorPage\";
import ProdutosPage from \"./pages/ProdutosPage\";
import HistoricoPage from \"./pages/HistoricoPage\";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem(\"rs_token\"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
        } catch (error) {
          console.error(\"Token verification failed:\", error);
          localStorage.removeItem(\"rs_token\");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    verifyToken();
  }, [token]);

  const login = async (email, senha) => {
    const response = await axios.post(`${API}/auth/login`, { email, senha });
    const { token: newToken, user: userData } = response.data;
    localStorage.setItem(\"rs_token\", newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (nome, email, senha) => {
    const response = await axios.post(`${API}/auth/register`, { nome, email, senha });
    const { token: newToken, user: userData } = response.data;
    localStorage.setItem(\"rs_token\", newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem(\"rs_token\");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className=\"min-h-screen flex items-center justify-center bg-black\">
        <div className=\"spinner-neon\"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to=\"/login\" replace />;
  }

  return children;
};

// Neon Background Component
export const NeonBackground = () => (
  <>
    <div className=\"matrix-grid\"></div>
    <div className=\"neon-glow neon-glow-green\"></div>
    <div className=\"neon-glow neon-glow-blue\"></div>
    <div className=\"neon-glow neon-glow-red\"></div>
  </>
);

function App() {
  return (
    <AuthProvider>
      <div className=\"App\">
        <Toaster 
          position=\"top-right\" 
          toastOptions={{
            style: {
              background: '#050505',
              border: '1px solid #00ff41',
              color: '#fff',
            },
          }}
        />
        <BrowserRouter>
          <Routes>
            <Route path=\"/\" element={<LandingPage />} />
            <Route path=\"/login\" element={<LoginPage />} />
            <Route path=\"/register\" element={<RegisterPage />} />
            <Route 
              path=\"/dashboard\" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path=\"/editor\" 
              element={
                <ProtectedRoute>
                  <EditorPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path=\"/produtos\" 
              element={
                <ProtectedRoute>
                  <ProdutosPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path=\"/historico\" 
              element={
                <ProtectedRoute>
                  <HistoricoPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;
"
Observation: Overwrite successful: /app/frontend/src/App.js
