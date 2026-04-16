import React from 'react';
import { useFinance } from '../hooks/useFinance';

const DRE: React.FC = () => {
  const { transactions, loading } = useFinance();

  // Filter only paid transactions
  const paidTransactions = transactions.filter(t => t.status === 'paid');

  const revenues = paidTransactions
    .filter(t => t.type === 'receivable')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const expenses = paidTransactions
    .filter(t => t.type === 'payable')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const netProfit = revenues - expenses;

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>DRE</h1>
        <p style={{ color: 'var(--text-light)' }}>Demonstrativo de Resultados do Exercício (Simificado).</p>
      </header>

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ padding: '1rem 0', borderBottom: '2px solid var(--border)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>Descrição</h3>
          <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>Valor (R$)</h3>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', fontWeight: 600 }}>
          <span>RECEITA OPERACIONAL BRUTA</span>
          <span style={{ color: 'var(--accent)' }}>{revenues.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0 0.75rem 1.5rem', color: 'var(--text-light)' }}>
          <span>Vendas de Produtos / Serviços</span>
          <span>{revenues.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>

        <div style={{ margin: '1rem 0', borderBottom: '1px solid var(--border)' }}></div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', fontWeight: 600 }}>
          <span>(-) DESPESAS OPERACIONAIS</span>
          <span style={{ color: 'var(--danger)' }}>({expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</span>
        </div>

        {/* Group by category if available */}
        {Array.from(new Set(paidTransactions.filter(t => t.type === 'payable').map(t => t.categories?.name))).map(catName => {
          const catTotal = paidTransactions
            .filter(t => t.type === 'payable' && t.categories?.name === catName)
            .reduce((acc, t) => acc + Number(t.amount), 0);
          
          return (
            <div key={catName} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0 0.5rem 1.5rem', color: 'var(--text-light)', fontSize: '0.875rem' }}>
              <span>{catName || 'Sem Categoria'}</span>
              <span>{catTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          );
        })}

        <div style={{ margin: '1.5rem 0', borderBottom: '2px solid var(--text)', opacity: 0.1 }}></div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          padding: '1.5rem', 
          background: netProfit >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
          borderRadius: 'var(--radius-md)',
          fontWeight: 700,
          fontSize: '1.25rem'
        }}>
          <span>LUCRO / PREJUÍZO LÍQUIDO</span>
          <span style={{ color: netProfit >= 0 ? 'var(--accent)' : 'var(--danger)' }}>
            R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DRE;
