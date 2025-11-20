import { useState } from 'react';
import { Link } from 'react-router-dom';
import "../styles/Register.css";

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);

    try {
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
    } catch (error) {
      setMensagem('❌ Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
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
            required
            disabled={loading}
          />

          <input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Crie uma senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="loading"></span>
                Criando conta...
              </>
            ) : (
              'Criar Conta'
            )}
          </button>
        </form>

        {mensagem && (
          <p className={`mensagem ${mensagem.includes('🎉') ? 'success' : 'error'}`}>
            {mensagem}
          </p>
        )}

        <p className="login-link">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}