import { useState, useEffect } from "react"; // ← ADICIONA O USEEFFECT AQUI
import "../styles/Login.css";
import { Link, useNavigate } from "react-router-dom";

// Componente de partículas separado
function ParticlesBackground() {
  useEffect(() => {
    const particlesContainer = document.querySelector('.particles');
    if (!particlesContainer) return;
    
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.width = `${Math.random() * 20 + 5}px`;
      particle.style.height = particle.style.width;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 6}s`;
      particle.style.opacity = Math.random() * 0.3 + 0.1;
      particlesContainer.appendChild(particle);
    }
  }, []);

  return <div className="particles"></div>;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensagem, setMensagem] = useState("");

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    const response = await fetch("http://localhost:3000/api/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      // SALVA O TOKEN
      localStorage.setItem("token", data.token);

      setMensagem("✔ Login realizado com sucesso!");

      // REDIRECIONA PARA O DASHBOARD
      navigate("/dashboard");

    } else {
      setMensagem(`❌ ${data.message}`);
    }
  }

  return (
    <div className="login-container">
      <ParticlesBackground />
      
      <header className="dashboard-header">
        <h1>Poupe APP</h1>
        <h5>O seu aplicativo de finanças</h5>
      </header>

      <div className="card">
        <h1>Bem-vindo de volta</h1>
        <p className="subtitle">Acesse sua conta para continuar</p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Entrar</button>
        </form>

        {mensagem && (
          <p className={`mensagem ${mensagem.includes('✔') ? 'success' : 'error'}`}>
            {mensagem}
          </p>
        )}

        <p className="register-link">
          Não tem conta? <Link to="/register">Criar conta</Link>
        </p>
      </div>
    </div>
  );
}