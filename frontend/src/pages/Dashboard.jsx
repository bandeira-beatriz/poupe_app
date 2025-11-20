import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import '../styles/Dashboard.css';

export default function Dashboard() {

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [transacoes, setTransacoes] = useState([]);
  const [estatisticas, setEstatisticas] = useState({});
  const [mesFiltro, setMesFiltro] = useState("all");
  const [anoFiltro, setAnoFiltro] = useState("all");
  const [categoriaFiltro, setCategoriaFiltro] = useState("all");
  const [categorias, setCategorias] = useState([]);
  const [tipoFiltro, setTipoFiltro] = useState("all");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [nova, setNova] = useState({
    description: "",
    valor: "",
    date: "",
    category_id: "",
    type: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    carregarCategorias(); 
    carregarTransacoes();
    carregarEstatisticas();
  }, []);

  // recarrega estatísticas quando filtradas
  // useEffect(() => {
  //   carregarEstatisticas();
  // }, [mesFiltro, anoFiltro]);


  async function criarCategoria() {
    const nome = prompt("Digite o nome da nova categoria:");
    if (!nome) return;

    const response = await fetch("http://localhost:3000/api/categories/cadastrar", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ description: nome })
    });

    const data = await response.json();

    if (data.success) {
      alert("Categoria criada!");
      carregarCategorias();
    } else {
      alert(data.message);
    }
  }

async function carregarCategorias() {
  try {
    const response = await fetch("http://localhost:3000/api/categories/tabela", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await response.json();
    
    // a rota retorna diretamente um array, então basta setar
    setCategorias(data);

  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
  }
}

async function carregarTransacoes() {
  let url = "http://localhost:3000/api/transactions/filtros?";
  const query = [];

  if (categoriaFiltro !== "all") query.push(`category_id=${categoriaFiltro}`);
  if (tipoFiltro !== "all") query.push(`tipo=${tipoFiltro}`);
  if (dataInicio) query.push(`data_inicio=${dataInicio}`);
  if (dataFim) query.push(`data_fim=${dataFim}`);

  url += query.join("&");
  
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await response.json();
    if (data.success) {
      setTransacoes(data.data);
    } else {
      console.log("❌ Erro na API:", data.message);
    }
  } catch (error) {
    console.error("💥 Erro ao carregar transações:", error);
  }
}

  async function carregarEstatisticas() {
    try {
      const url = `http://localhost:3000/api/transactions/estatisticas?mes=${mesFiltro}&ano=${anoFiltro}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        setEstatisticas(data.data);
      }
    } catch (error) {
      console.error('Erro no fetch:', error);
    }
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

  function handleLogout() {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  }

  function handleGraficos() {
    const form = document.querySelector(".filtros-transacao");
    if (form) form.scrollIntoView({ behavior: "smooth" });
  }

  function handleNovaTransacao() {
    const form = document.querySelector(".form-transacao");
    if (form) form.scrollIntoView({ behavior: "smooth" });
  }

  const anoAtual = new Date().getFullYear();
  const anosNoFuturo = 5;
  const anosNoPassado = 5;

  const anos = Array.from({ length: anosNoFuturo + anosNoPassado + 1 }, (_, i) => 
    anoAtual - anosNoPassado + i
  );
  return (
    <div className="dashboard-container">
      {/* CABEÇALHO */}
      <header className="dashboard-header">
        <h1>Poupe APP</h1>
        <h5>O seu aplicativo de finanças</h5>
        <div className="header-buttons">
          <button onClick={handleNovaTransacao}>Nova Transação</button>
          <button onClick={handleGraficos}>Dashboards</button>
          <button onClick={handleLogout}>Sair</button>
        </div>
      </header>

      {/* FILTROS ESTATÍSTICAS */}
      <div className="filtros-estatisticas">
        <h3>Filtros</h3>

        <select value={mesFiltro} onChange={(e) => setMesFiltro(e.target.value)}>
          <option value="all">Todos os meses</option>
          <option value="1">Janeiro</option>
          <option value="2">Fevereiro</option>
          <option value="3">Março</option>
          <option value="4">Abril</option>
          <option value="5">Maio</option>
          <option value="6">Junho</option>
          <option value="7">Julho</option>
          <option value="8">Agosto</option>
          <option value="9">Setembro</option>
          <option value="10">Outubro</option>
          <option value="11">Novembro</option>
          <option value="12">Dezembro</option>
        </select>

        <select value={anoFiltro} onChange={(e) => setAnoFiltro(e.target.value)}>
          <option value="all">Todos os anos</option>
          {anos.map(ano => (
            <option key={ano} value={ano.toString()}>
              {ano}
            </option>
          ))}
        </select>

        <button onClick={carregarEstatisticas}>Filtrar</button>
      </div>

      {/* ESTATÍSTICAS */}
      <div className="stats-box">
        <div><strong>Receitas:</strong> R$ {estatisticas?.receitas ? Number(estatisticas.receitas).toFixed(2) : "0,00"}</div>
        <div><strong>Despesas:</strong> R$ {estatisticas?.despesas ? Number(estatisticas.despesas).toFixed(2) : "0,00"}</div>
        <div><strong>Transferência:</strong> R$ {estatisticas?.transferencias ? Number(estatisticas.transferencias).toFixed(2) : "0,00"}</div>
        <div><strong>Investimentos:</strong> R$ {estatisticas?.investimentos ? Number(estatisticas.investimentos).toFixed(2) : "0,00"}</div>
        <div><strong>Empréstimo:</strong> R$ {estatisticas?.emprestimos ? Number(estatisticas.emprestimos).toFixed(2) : "0,00"}</div>
        <div><strong>Saldo:</strong> R$ {estatisticas?.saldo ? Number(estatisticas.saldo).toFixed(2) : "0,00"}</div>
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
          {categorias.map(categoria => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.description}
            </option>
          ))}
        </select>

        <button type="button" onClick={criarCategoria}>Nova categoria</button>

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

      {/* FILTROS TRANSAÇÕES */}
      <div className="filtros-transacao">
        <h3>Filtros</h3>
        
        <div className="filtros-grid">
          <select value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)}>
            <option value="all">Todas as categorias</option>
            {categorias.map(categoria => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.description}
              </option>
            ))}
          </select>

          <select value={tipoFiltro} onChange={e => setTipoFiltro(e.target.value)}>
            <option value="all">Todos os tipos</option>
            <option value="Receita">Receita</option>
            <option value="Despesa">Despesa</option>
            <option value="Transferência">Transferência</option>
            <option value="Investimento">Investimento</option>
            <option value="Empréstimo">Empréstimo</option>
          </select>

          <input 
            type="date" 
            value={dataInicio} 
            onChange={e => setDataInicio(e.target.value)}
          />
          
          <input 
            type="date" 
            value={dataFim} 
            onChange={e => setDataFim(e.target.value)}
          />
          <button onClick={carregarTransacoes}>Aplicar Filtros</button>
        </div>
      </div>
      
      {/* LISTAGEM */}
      <div className="lista">
        <h2>Transações</h2>

        <div className="lista-header">
          <span>Descrição</span>
          <span>Valor</span>
          <span>Data</span>
          <span>Categoria</span>
          <span>Tipo</span>
        </div>

        {transacoes.length > 0 ? (
          transacoes.map((t) => (
            <div className="item" key={t.id} data-type={t.type}>
              <span>{t.description}</span>
              <span>R$ {Number(t.valor).toFixed(2)}</span>
              <span>{new Date(t.date).toLocaleDateString('pt-BR')}</span>
              <span>{t.category_name}</span>
              <span>{t.type}</span>
            </div>
          ))
        ) : (
          <div className="item" style={{ textAlign: 'center', color: 'var(--white)' }}>
            <span>Nenhuma transação encontrada</span>
          </div>
        )}
      </div>
    </div>
  );
}
