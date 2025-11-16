import { useEffect, useState } from "react";
import '../styles/Dashboard.css';

export default function Dashboard() {
  const [token] = useState(localStorage.getItem("token"));
  const [transacoes, setTransacoes] = useState([]);
  const [estatisticas, setEstatisticas] = useState({});
  const [nova, setNova] = useState({
    description: "",
    valor: "",
    date: "",
    category_id: "",
    type: ""
  });

  useEffect(() => {
    carregarTransacoes();
    carregarEstatisticas();
  }, []);

  async function carregarTransacoes() {
    const response = await fetch("http://localhost:3000/api/transactions/filtros", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await response.json();
    if (data.success) setTransacoes(data.data);
  }

  async function carregarEstatisticas() {
    const response = await fetch("http://localhost:3000/api/transactions/estatisticas", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await response.json();
    if (data.success) setEstatisticas(data.data);
  }

  async function enviarTransacao(e) {
    e.preventDefault();

    const response = await fetch("http://localhost:3000/api/transactions/inserir", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(nova)
    });

    const data = await response.json();

    if (data.success) {
      alert("Transação criada!");
      carregarTransacoes();
      carregarEstatisticas();
      setNova({ description: "", valor: "", date: "", category_id: "", type: "" });
    } else {
      alert(data.message);
    }
  }

  return (
    <div className="dashboard-container">

      <h1>Controle Financeiro</h1>

      {/* ESTATÍSTICAS */}
      <div className="stats-box">
        <div>
          <strong>Receitas:</strong> 
          R$ {estatisticas?.receitas ? Number(estatisticas.receitas).toFixed(2) : "0,00"}
        </div>
        <div>
          <strong>Despesas:</strong> 
          R$ {estatisticas?.despesas ? Number(estatisticas.despesas).toFixed(2) : "0,00"}
        </div>
        <div>
          <strong>Investimentos:</strong> 
          R$ {estatisticas?.investimentos ? Number(estatisticas.investimentos).toFixed(2) : "0,00"}
        </div>
        <div>
          <strong>Saldo:</strong> 
          R$ {estatisticas?.saldo ? Number(estatisticas.saldo).toFixed(2) : "0,00"}
        </div>
      </div>

      {/* NOVA TRANSAÇÃO */}
      <form className="form-transacao" onSubmit={enviarTransacao}>
        <h2>Nova Transação</h2>

        <input 
          type="text" 
          placeholder="Descrição"
          value={nova.description}
          onChange={(e) => setNova({ ...nova, description: e.target.value })}
          required
        />

        <input 
          type="number" 
          placeholder="Valor"
          step="0.01"
          value={nova.valor}
          onChange={(e) => setNova({ ...nova, valor: e.target.value })}
          required
        />

        <input 
          type="date"
          value={nova.date}
          onChange={(e) => setNova({ ...nova, date: e.target.value })}
          required
        />

        <select
          value={nova.category_id}
          onChange={(e) => setNova({ ...nova, category_id: e.target.value })}
          required
        >
          <option value="">Selecione uma categoria</option>
          <option value="1">Alimentação</option>
          <option value="2">Transporte</option>
          <option value="3">Salário</option>
          <option value="4">Lazer</option>
          <option value="5">Consumos Básicos</option>
          <option value="6">Consumos Diversos</option>
        </select>

        <select
          value={nova.type}
          onChange={(e) => setNova({ ...nova, type: e.target.value })}
          required
        >
          <option value="">Selecione o tipo</option>
          <option value="Receita">Receita</option>
          <option value="Despesa">Despesa</option>
          <option value="Transferência">Transferência</option>
          <option value="Investimento">Investimento</option>
          <option value="Empréstimo">Empréstimo</option>
        </select>

        <button type="submit">Cadastrar Transação</button>
      </form>

      {/* LISTAGEM DE TRANSAÇÕES */}
      <div className="lista">
        <h2>Transações</h2>
        
        {/* Cabeçalho da lista */}
        <div className="lista-header">
          <span>Descrição</span>
          <span>Valor</span>
          <span>Data</span>
          <span>Categoria</span>
          <span>Tipo</span>
        </div>

        {/* Lista de transações */}
        {transacoes.length > 0 ? (
          transacoes.map((t) => (
            <div 
              className="item" 
              key={t.id}
              data-type={t.type}
            >
              <span>{t.description}</span>
              <span>R$ {Number(t.valor).toFixed(2)}</span>
              <span>{new Date(t.date).toLocaleDateString('pt-BR')}</span>
              <span>{t.category_name}</span>
              <span>{t.type}</span>
            </div>
          ))
        ) : (
          <div className="item" style={{textAlign: 'center', color: 'var(--white)'}}>
            <span>Nenhuma transação encontrada</span>
          </div>
        )}
      </div>
    </div>
  );
}
Princip
