import { useState } from "react";
import "../styles/Login.css";
import { Link, useNavigate } from "react-router-dom";
export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensagem, setMensagem] = useState("");

  const navigate = useNavigate(); // ← CRIA O NAVIGATE


  async function handleLogin(e) {
    e.preventDefault();

    const response = await fetch("http://localhost:3000/api/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      // 🔥 SALVA O TOKEN
      localStorage.setItem("token", data.token);

      setMensagem("✔ Login realizado com sucesso!");

      // 🔥 REDIRECIONA PARA O DASHBOARD
      navigate("/dashboard");

    } else {
      setMensagem(`❌ ${data.message}`);
    }
  }

  return (
    <div className="login-container">
      <div className="card">
        <h1>Bem-vindo de volta</h1>
        <p className="subtitle">Acesse sua conta para continuar</p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Entrar</button>
        </form>

        {mensagem && <p className="mensagem">{mensagem}</p>}

        <p className="register-link">
          Não tem conta? <Link to="/register">Criar conta</Link>
        </p>
      </div>
    </div>
  );
}