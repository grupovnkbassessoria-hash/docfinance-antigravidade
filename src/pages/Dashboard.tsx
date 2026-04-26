import React from 'react';
import { useFinance } from '../hooks/useFinance';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  AlertCircle 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const Dashboard: React.FC = () => {
  const { transactions, banks, loading } = useFinance();

  const totalReceivable = transactions
    .filter(t => t.type === 'receivable' && t.status === 'pending')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalPayable = transactions
    .filter(t => t.type === 'payable' && t.status === 'pending')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const cashBalance = banks.reduce((acc, b) => acc + Number(b.current_balance), 0);

  const chartData = [
    { name: 'Receber', value: totalReceivable, color: '#10b981' },
    { name: 'Pagar', value: totalPayable, color: '#ef4444' },
  ];

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Visão Geral</h1>
        <p style={{ color: 'var(--text-light)' }}>Acompanhe a saúde financeira da sua empresa.</p>
      </header>

      <div className="stats-grid">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-light)' }}>Saldo em Caixa</span>
            <Wallet style={{ color: 'var(--primary)' }} size={20} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            R$ {cashBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-light)' }}>A Receber</span>
            <TrendingUp style={{ color: 'var(--accent)' }} size={20} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>
            R$ {totalReceivable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-light)' }}>A Pagar</span>
            <TrendingDown style={{ color: 'var(--danger)' }} size={20} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger)' }}>
            R$ {totalPayable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-light)' }}>Pendências</span>
            <AlertCircle style={{ color: 'var(--warning)' }} size={20} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {transactions.filter(t => t.status === 'pending').length} itens
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Fluxo de Caixa (Pendentes)</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `R$ ${value}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: 'var(--radius-md)', border: 'none', boxShadow: 'var(--shadow-lg)' }}
                  formatter={(value: any) => `R$ ${Number(value || 0).toLocaleString('pt-BR')}`}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Últimas Movimentações</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Data</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 5).map(t => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const due = new Date(t.due_date);
                  due.setHours(0, 0, 0, 0);
                  const diffTime = due.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  
                  let bgColor = 'transparent';
                  if (t.status === 'paid') {
                    bgColor = 'rgba(16, 185, 129, 0.08)'; // Paid (green)
                  } else {
                    if (diffDays < 0) bgColor = 'rgba(239, 68, 68, 0.12)'; // Overdue (red)
                    else if (diffDays <= 15) bgColor = 'rgba(251, 191, 36, 0.15)'; // Near due (yellow)
                  }

                  return (
                    <tr key={t.id} style={{ background: bgColor }}>
                      <td>{t.description}</td>
                      <td>{new Date(t.due_date).toLocaleDateString()}</td>
                      <td style={{ color: t.type === 'receivable' ? 'var(--accent)' : 'var(--danger)', fontWeight: 600 }}>
                        {t.type === 'receivable' ? '+' : '-'} R$ {Number(t.amount).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
