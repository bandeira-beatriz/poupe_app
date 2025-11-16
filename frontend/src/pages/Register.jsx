import { useState } from 'react';
import "../styles/Register.css";

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensagem, setMensagem] = useState('');

  async function handleRegister(e) {
    e.preventDefault();

    const response = await fetch('http://localhost:3000/api/user/registrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (data.success) {
      setMensagem('🎉 Conta criada com sucesso! Redirecionando...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } else {
      setMensagem(`❌ ${data.message}`);
    }
  }

  return (
    <div className="register-container">
      <div className="card">
        <h1>Crie sua conta</h1>
        <p className="subtitle">Junte-se à nossa plataforma</p>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Seu nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Crie uma senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Criar Conta</button>
        </form>

        {mensagem && <p className="mensagem">{mensagem}</p>}

        <p className="login-link">
          Já tem conta? <a href="/login">Entrar</a>
        </p>
      </div>
    </div>
  );
}