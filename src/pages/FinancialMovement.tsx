import React, { useState, useMemo } from 'react';
import { useFinance } from '../hooks/useFinance';


import { List, BarChart3, Download, Search } from 'lucide-react';

const FinancialMovement: React.FC = () => {
  const { transactions, categories, loading } = useFinance();
  const [viewType, setViewType] = useState<'analytic' | 'synthetic'>('analytic');
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    category_id: '',
    type: 'all' as 'all' | 'payable' | 'receivable'
  });

  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      const date = t.due_date;
      const matchesDate = date >= filters.startDate && date <= filters.endDate;
      const matchesCategory = !filters.category_id || t.category_id === filters.category_id;
      const matchesType = filters.type === 'all' || t.type === filters.type;
      return matchesDate && matchesCategory && matchesType;
    });
  }, [transactions, filters]);

  const syntheticData = useMemo(() => {
    const groups: Record<string, { name: string, type: string, total: number, count: number }> = {};
    
    filteredData.forEach(t => {
      const catId = t.category_id || 'others';
      const catName = t.categories?.name || 'Sem Categoria';
      if (!groups[catId]) {
        groups[catId] = { name: catName, type: t.type, total: 0, count: 0 };
      }
      groups[catId].total += Number(t.amount);
      groups[catId].count += 1;
    });
    
    return Object.values(groups).sort((a, b) => b.total - a.total);
  }, [filteredData]);

  const totalIn = filteredData.filter(t => t.type === 'receivable').reduce((acc, t) => acc + Number(t.amount), 0);
  const totalOut = filteredData.filter(t => t.type === 'payable').reduce((acc, t) => acc + Number(t.amount), 0);
  const balance = totalIn - totalOut;

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Movimentação Financeira</h1>
          <p style={{ color: 'var(--text-light)' }}>Relatório detalhado ou sintetizado por período e categoria.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ background: 'var(--surface)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex' }}>
            <button 
              className={`btn ${viewType === 'analytic' ? 'btn-primary' : ''}`} 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
              onClick={() => setViewType('analytic')}
            >
              <List size={16} /> Analítico
            </button>
            <button 
              className={`btn ${viewType === 'synthetic' ? 'btn-primary' : ''}`} 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
              onClick={() => setViewType('synthetic')}
            >
              <BarChart3 size={16} /> Sintético
            </button>
          </div>
          <button className="btn" style={{ border: '1px solid var(--border)' }} onClick={() => window.print()}>
            <Download size={20} /> Exportar
          </button>
        </div>
      </header>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '1.5rem', alignItems: 'flex-end' }}>
          <div className="form-group">
            <label className="form-label">Data Inicial</label>
            <input type="date" className="input" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Data Final</label>
            <input type="date" className="input" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Categoria</label>
            <select className="input" value={filters.category_id} onChange={e => setFilters({ ...filters, category_id: e.target.value })}>
              <option value="">Todas as Categorias</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.type === 'income' ? 'Rec' : 'Desp'})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Tipo</label>
            <select className="input" value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value as any })}>
              <option value="all">Todos os Lançamentos</option>
              <option value="receivable">Somente Receitas</option>
              <option value="payable">Somente Despesas</option>
            </select>
          </div>
          <div style={{ paddingBottom: '1.25rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--background)', color: 'var(--primary)' }}>
              <Search size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ borderLeft: '6px solid var(--accent)' }}>
          <div style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>Total Entradas</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>R$ {totalIn.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="card" style={{ borderLeft: '6px solid var(--danger)' }}>
          <div style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>Total Saídas</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger)' }}>R$ {totalOut.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="card" style={{ borderLeft: `6px solid ${balance >= 0 ? 'var(--primary)' : 'var(--danger)'}` }}>
          <div style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>Saldo no Período</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: balance >= 0 ? 'var(--primary)' : 'var(--danger)' }}>R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      <div className="card">
        {viewType === 'analytic' ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Entidade</th>
                  <th>Categoria</th>
                  <th>Valor</th>
                  <th>Tipo</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(t => (
                  <tr key={t.id}>
                    <td>{new Date(t.due_date).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 500 }}>{t.description}</td>
                    <td>{t.entities?.name || '-'}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.categories?.color || '#ccc' }}></div>
                        {t.categories?.name || 'Sem Categoria'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: t.type === 'receivable' ? 'var(--accent)' : 'var(--danger)' }}>
                      R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-light)' }}>
                        {t.type === 'receivable' ? 'Receita' : 'Despesa'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th>Tipo</th>
                  <th>Qtd Lançamentos</th>
                  <th>Valor Total</th>
                  <th>% do Total</th>
                </tr>
              </thead>
              <tbody>
                {syntheticData.map((group, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{group.name}</td>
                    <td>{group.type === 'receivable' ? 'Receita' : 'Despesa'}</td>
                    <td>{group.count}</td>
                    <td style={{ fontWeight: 700, color: group.type === 'receivable' ? 'var(--accent)' : 'var(--danger)' }}>
                      R$ {group.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      {((group.total / (group.type === 'receivable' ? totalIn : totalOut)) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialMovement;
