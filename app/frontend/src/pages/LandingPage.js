
Action: file_editor create /app/frontend/src/pages/LandingPage.js --file-text "import { Link } from \"react-router-dom\";
import { useAuth, NeonBackground } from \"../App\";
import { FileText, Layers, Zap, Download, Shield, Clock, Check, ArrowRight, Menu, X } from \"lucide-react\";
import { useState } from \"react\";

const Navbar = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className=\"navbar-neon fixed top-0 left-0 right-0 z-50 px-6 py-4\">
      <div className=\"max-w-7xl mx-auto flex items-center justify-between\">
        <Link to=\"/\" className=\"flex items-center gap-3\" data-testid=\"logo-link\">
          <h1 className=\"logo-neon text-2xl font-bold tracking-tight\">RSEncartes</h1>
        </Link>

        {/* Desktop Menu */}
        <div className=\"hidden md:flex items-center gap-8\">
          <a href=\"#features\" className=\"text-gray-400 hover:text-white transition-colors\">Recursos</a>
          <a href=\"#pricing\" className=\"text-gray-400 hover:text-white transition-colors\">Planos</a>
          {user ? (
            <Link to=\"/dashboard\" className=\"btn-neon px-6 py-2 text-sm\" data-testid=\"dashboard-btn\">
              Dashboard
            </Link>
          ) : (
            <div className=\"flex items-center gap-4\">
              <Link to=\"/login\" className=\"text-gray-400 hover:text-white transition-colors\" data-testid=\"login-link\">
                Entrar
              </Link>
              <Link to=\"/register\" className=\"btn-neon px-6 py-2 text-sm\" data-testid=\"register-btn\">
                Cadastrar
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className=\"md:hidden text-white\"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          data-testid=\"mobile-menu-btn\"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className=\"md:hidden absolute top-full left-0 right-0 bg-black border-b border-[#00ff41]/20 p-6\">
          <div className=\"flex flex-col gap-4\">
            <a href=\"#features\" className=\"text-gray-400 hover:text-white\">Recursos</a>
            <a href=\"#pricing\" className=\"text-gray-400 hover:text-white\">Planos</a>
            {user ? (
              <Link to=\"/dashboard\" className=\"btn-neon px-6 py-2 text-sm text-center\">Dashboard</Link>
            ) : (
              <>
                <Link to=\"/login\" className=\"text-gray-400 hover:text-white\">Entrar</Link>
                <Link to=\"/register\" className=\"btn-neon px-6 py-2 text-sm text-center\">Cadastrar</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

const HeroSection = () => (
  <section className=\"hero-section pt-24 pb-16 px-6\">
    <div className=\"max-w-7xl mx-auto\">
      <div className=\"grid lg:grid-cols-2 gap-12 items-center\">
        <div className=\"animate-fade-in\">
          <p className=\"text-[#00ff41] font-orbitron text-xs tracking-[0.2em] uppercase mb-4\">
            Gerador de Encartes Profissional
          </p>
          <h1 className=\"font-orbitron text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6\">
            <span className=\"text-white\">Crie Encartes</span>
            <br />
            <span className=\"logo-neon\">Cyberpunk Neon</span>
          </h1>
          <p className=\"font-rajdhani text-lg text-gray-400 leading-relaxed mb-8 max-w-xl\">
            Dê vida às suas ofertas com designs profissionais e modernos. 
            Templates 100% prontos para supermercados, hortifruti, farmácias e muito mais.
          </p>
          <div className=\"flex flex-wrap gap-4\">
            <Link 
              to=\"/register\" 
              className=\"btn-neon px-8 py-3 text-sm flex items-center gap-2\"
              data-testid=\"hero-cta-btn\"
            >
              Começar Grátis <ArrowRight size={18} />
            </Link>
            <a 
              href=\"#features\" 
              className=\"px-8 py-3 text-sm border border-white/20 text-white hover:border-white/40 transition-colors\"
            >
              Ver Recursos
            </a>
          </div>
        </div>
        <div className=\"hidden lg:block animate-slide-in\">
          <div className=\"relative\">
            <div className=\"canvas-preview-container mx-auto\">
              <div className=\"absolute inset-0 bg-gradient-to-b from-[#00ff41]/10 to-transparent\"></div>
              <div className=\"p-6 h-full flex flex-col\">
                <h3 className=\"font-orbitron text-[#00ff41] text-center text-sm mb-4\">OFERTAS DA SEMANA</h3>
                <div className=\"grid grid-cols-2 gap-3 flex-1\">
                  {[1,2,3,4].map(i => (
                    <div key={i} className=\"bg-[#0a0a0a] border border-[#00ff41]/20 p-2 flex flex-col\">
                      <div className=\"bg-[#1a1a1a] flex-1 mb-2\"></div>
                      <p className=\"text-white text-xs truncate\">Produto {i}</p>
                      <p className=\"text-[#ffed00] font-bold text-sm\">R$ 9,99</p>
                    </div>
                  ))}
                </div>
                <p className=\"text-center text-[#00ff41]/50 text-xs mt-4 font-orbitron\">RSEncartes Neon</p>
              </div>
            </div>
            <div className=\"absolute -top-4 -right-4 w-20 h-20 bg-[#00ff41] rounded-full blur-3xl opacity-20\"></div>
            <div className=\"absolute -bottom-4 -left-4 w-16 h-16 bg-[#00d4ff] rounded-full blur-3xl opacity-20\"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const MarqueeSection = () => (
  <div className=\"marquee-container py-4\">
    <div className=\"marquee-text\">
      SUPERMERCADOS • HORTIFRUTI • FARMÁCIAS • ATACADISTAS • PADARIAS • AÇOUGUES • 
      SUPERMERCADOS • HORTIFRUTI • FARMÁCIAS • ATACADISTAS • PADARIAS • AÇOUGUES • 
    </div>
  </div>
);

const FeaturesSection = () => {
  const features = [
    { icon: <Layers className=\"text-[#00ff41]\" size={32} />, title: \"Templates Prontos\", desc: \"5+ templates profissionais para diferentes segmentos\" },
    { icon: <Zap className=\"text-[#00d4ff]\" size={32} />, title: \"Geração Rápida\", desc: \"Crie encartes em segundos com nossa tecnologia\" },
    { icon: <Download className=\"text-[#ff0040]\" size={32} />, title: \"Export PNG/PDF\", desc: \"Exporte em alta qualidade para signage e impressão\" },
    { icon: <FileText className=\"text-[#ffed00]\" size={32} />, title: \"Gestão de Produtos\", desc: \"Cadastre e organize seus produtos facilmente\" },
    { icon: <Shield className=\"text-[#00ff41]\" size={32} />, title: \"Multi-tenant\", desc: \"Cada cliente com seus próprios produtos\" },
    { icon: <Clock className=\"text-[#00d4ff]\" size={32} />, title: \"Histórico\", desc: \"Acesse todos os encartes já criados\" },
  ];

  return (
    <section id=\"features\" className=\"py-20 px-6\">
      <div className=\"max-w-7xl mx-auto\">
        <div className=\"text-center mb-16\">
          <p className=\"text-[#00ff41] font-orbitron text-xs tracking-[0.2em] uppercase mb-4\">Recursos</p>
          <h2 className=\"font-orbitron text-3xl sm:text-4xl font-bold tracking-tight text-white\">
            Tudo que você precisa
          </h2>
        </div>
        <div className=\"grid sm:grid-cols-2 lg:grid-cols-3 gap-6\">
          {features.map((feature, i) => (
            <div key={i} className=\"feature-card p-8\" data-testid={`feature-card-${i}`}>
              <div className=\"mb-4\">{feature.icon}</div>
              <h3 className=\"font-orbitron text-lg font-bold text-white mb-2\">{feature.title}</h3>
              <p className=\"text-gray-400 font-rajdhani\">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const PricingSection = () => {
  const plans = [
    {
      name: \"Básico\",
      price: \"Grátis\",
      color: \"#00ff41\",
      features: [\"5 encartes/mês\", \"3 templates\", \"Export PNG\", \"Suporte básico\"],
      cta: \"Começar Grátis\",
      type: \"basic\"
    },
    {
      name: \"Pro\",
      price: \"R$ 49\",
      period: \"/mês\",
      color: \"#00d4ff\",
      features: [\"Encartes ilimitados\", \"Todos templates\", \"Export PNG + PDF\", \"Suporte prioritário\", \"Sem marca d'água\"],
      cta: \"Assinar Pro\",
      popular: true,
      type: \"pro\"
    },
    {
      name: \"Premium\",
      price: \"R$ 99\",
      period: \"/mês\",
      color: \"#ff0040\",
      features: [\"Tudo do Pro\", \"Templates exclusivos\", \"API de integração\", \"Suporte 24/7\", \"Múltiplos usuários\"],
      cta: \"Assinar Premium\",
      type: \"premium\"
    }
  ];

  return (
    <section id=\"pricing\" className=\"py-20 px-6\">
      <div className=\"max-w-7xl mx-auto\">
        <div className=\"text-center mb-16\">
          <p className=\"text-[#00d4ff] font-orbitron text-xs tracking-[0.2em] uppercase mb-4\">Planos</p>
          <h2 className=\"font-orbitron text-3xl sm:text-4xl font-bold tracking-tight text-white\">
            Escolha seu plano
          </h2>
        </div>
        <div className=\"grid md:grid-cols-3 gap-6 max-w-5xl mx-auto\">
          {plans.map((plan, i) => (
            <div 
              key={i} 
              className={`pricing-card ${plan.type} p-8 relative`}
              data-testid={`pricing-card-${plan.type}`}
            >
              {plan.popular && (
                <div className=\"absolute -top-3 left-1/2 -translate-x-1/2 badge-discount px-4 py-1 text-xs\">
                  Popular
                </div>
              )}
              <h3 className=\"font-orbitron text-lg mb-2\" style={{ color: plan.color }}>{plan.name}</h3>
              <div className=\"mb-6\">
                <span className=\"text-4xl font-bold text-white\">{plan.price}</span>
                {plan.period && <span className=\"text-gray-400\">{plan.period}</span>}
              </div>
              <ul className=\"space-y-3 mb-8\">
                {plan.features.map((feature, j) => (
                  <li key={j} className=\"flex items-center gap-2 text-gray-300\">
                    <Check size={16} style={{ color: plan.color }} />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link 
                to=\"/register\"
                className=\"block text-center py-3 border-2 font-orbitron text-sm uppercase tracking-wider transition-all hover:shadow-lg\"
                style={{ 
                  borderColor: plan.color, 
                  color: plan.color,
                }}
                data-testid={`pricing-cta-${plan.type}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className=\"py-12 px-6 border-t border-white/10\">
    <div className=\"max-w-7xl mx-auto\">
      <div className=\"grid md:grid-cols-4 gap-8\">
        <div>
          <h3 className=\"logo-neon text-xl font-bold mb-4\">RSEncartes</h3>
          <p className=\"text-gray-400 text-sm\">
            Gerador de encartes profissional para supermercados e comércios.
          </p>
        </div>
        <div>
          <h4 className=\"font-orbitron text-sm text-[#00ff41] mb-4\">Produto</h4>
          <ul className=\"space-y-2 text-gray-400 text-sm\">
            <li><a href=\"#features\" className=\"hover:text-white transition-colors\">Recursos</a></li>
            <li><a href=\"#pricing\" className=\"hover:text-white transition-colors\">Planos</a></li>
            <li><Link to=\"/register\" className=\"hover:text-white transition-colors\">Cadastro</Link></li>
          </ul>
        </div>
        <div>
          <h4 className=\"font-orbitron text-sm text-[#00d4ff] mb-4\">Segmentos</h4>
          <ul className=\"space-y-2 text-gray-400 text-sm\">
            <li>Supermercados</li>
            <li>Hortifruti</li>
            <li>Farmácias</li>
            <li>Atacadistas</li>
          </ul>
        </div>
        <div>
          <h4 className=\"font-orbitron text-sm text-[#ff0040] mb-4\">Contato</h4>
          <ul className=\"space-y-2 text-gray-400 text-sm\">
            <li>contato@studiorsdesign.com.br</li>
            <li>São Sebastião - SP</li>
          </ul>
        </div>
      </div>
      <div className=\"mt-12 pt-8 border-t border-white/10 text-center text-gray-500 text-sm\">
        <p>© 2024 RSEncartes. Parte do ecossistema Studio RS.</p>
      </div>
    </div>
  </footer>
);

export default function LandingPage() {
  return (
    <div className=\"min-h-screen relative\">
      <NeonBackground />
      <div className=\"relative z-10\">
        <Navbar />
        <HeroSection />
        <MarqueeSection />
        <FeaturesSection />
        <PricingSection />
        <Footer />
      </div>
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/pages/LandingPage.js
