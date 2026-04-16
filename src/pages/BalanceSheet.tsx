import React from 'react';
import { useFinance } from '../hooks/useFinance';

const BalanceSheet: React.FC = () => {
  const { transactions, banks, loading } = useFinance();

  const cashBalance = banks.reduce((acc, b) => acc + Number(b.current_balance), 0);
  const totalReceivable = transactions
    .filter(t => t.type === 'receivable' && t.status === 'pending')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalPayable = transactions
    .filter(t => t.type === 'payable' && t.status === 'pending')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalAssets = cashBalance + totalReceivable;
  const totalLiabilities = totalPayable;
  const equity = totalAssets - totalLiabilities;

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Balanço Patrimonial</h1>
        <p style={{ color: 'var(--text-light)' }}>Fotografia da situação financeira atual da empresa.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Ativos */}
        <div className="card">
          <h3 style={{ textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>ATIVOS</h3>
          
          <div style={{ padding: '0.75rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
              <span>ATIVO CIRCULANTE</span>
              <span>{totalAssets.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0 0.5rem 1rem', color: 'var(--text-light)' }}>
              <span>Disponibilidades (Bancos/Caixa)</span>
              <span>{cashBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0 0.5rem 1rem', color: 'var(--text-light)' }}>
              <span>Contas a Receber (Pendentes)</span>
              <span>{totalReceivable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
            <span>TOTAL ATIVOS</span>
            <span>R$ {totalAssets.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Passivos e PL */}
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ textTransform: 'uppercase', color: 'var(--danger)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>PASSIVOS</h3>
            
            <div style={{ padding: '0.75rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span>PASSIVO CIRCULANTE</span>
                <span>{totalLiabilities.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0 0.5rem 1rem', color: 'var(--text-light)' }}>
                <span>Contas a Pagar (Fornecedores/Outros)</span>
                <span>{totalPayable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>TOTAL PASSIVOS</span>
              <span>R$ {totalLiabilities.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="card">
            <h3 style={{ textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>PATRIMÔNIO LÍQUIDO</h3>
            
            <div style={{ padding: '0.75rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span>SITUAÇÃO LÍQUIDA</span>
                <span style={{ color: equity >= 0 ? 'var(--accent)' : 'var(--danger)' }}>
                  {equity.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>PASSIVO + PL</span>
              <span>R$ {(totalLiabilities + equity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;
