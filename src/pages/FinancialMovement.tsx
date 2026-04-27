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
    type: 'all' as 'all' | 'payable' | 'receivable',
    responsible: 'all' as 'all' | 'Clara' | 'Victor' | 'Casa'
  });

  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      const date = t.due_date;
      const matchesDate = date >= filters.startDate && date <= filters.endDate;
      const matchesCategory = !filters.category_id || t.category_id === filters.category_id;
      const matchesType = filters.type === 'all' || t.type === filters.type;
      const matchesResponsible = filters.responsible === 'all' || t.responsible === filters.responsible;
      return matchesDate && matchesCategory && matchesType && matchesResponsible;
    });
  }, [transactions, filters]);

  const syntheticData = useMemo(() => {
    const groups: Record<string, { name: string, type: string, total: number, count: number, parent_name?: string }> = {};
    
    filteredData.forEach(t => {
      const catId = t.category_id || 'others';
      const category = categories.find(c => c.id === catId);
      const parent = category?.parent_id ? categories.find(c => c.id === category.parent_id) : null;
      
      const catName = category?.name || 'Sem Categoria';
      const parentName = parent?.name;
      
      if (!groups[catId]) {
        groups[catId] = { 
          name: catName, 
          type: t.type, 
          total: 0, 
          count: 0,
          parent_name: parentName
        };
      }
      groups[catId].total += Number(t.amount);
      groups[catId].count += 1;
    });
    
    return Object.values(groups).sort((a, b) => {
      const aPath = a.parent_name ? `${a.parent_name} > ${a.name}` : a.name;
      const bPath = b.parent_name ? `${b.parent_name} > ${b.name}` : b.name;
      return aPath.localeCompare(bPath);
    });
  }, [filteredData, categories]);

  const totalIn = filteredData.filter(t => t.type === 'receivable').reduce((acc, t) => acc + Number(t.amount), 0);
  const totalOut = filteredData.filter(t => t.type === 'payable').reduce((acc, t) => acc + Number(t.amount), 0);
  const balance = totalIn - totalOut;

  const getRowStyle = (t: any) => {
    if (t.status === 'paid') {
      return { background: 'rgba(16, 185, 129, 0.08)' }; // Paid (green)
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(t.due_date);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { background: 'rgba(239, 68, 68, 0.12)' }; // Overdue (red)
    if (diffDays <= 15) return { background: 'rgba(251, 191, 36, 0.15)' }; // Near due (yellow)
    
    return { background: 'transparent' };
  };

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

      <div className="card no-print" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Filtrar por Mês:</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select 
                className="input" 
                onChange={(e) => {
                  const m = e.target.value;
                  const y = (document.getElementById('year-select') as HTMLSelectElement).value;
                  if (m !== 'all' && y !== 'all') {
                    const start = new Date(parseInt(y), parseInt(m) - 1, 1);
                    const end = new Date(parseInt(y), parseInt(m), 0);
                    setFilters({ ...filters, startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] });
                  }
                }}
                defaultValue={(new Date().getMonth() + 1).toString().padStart(2, '0')}
                id="month-select"
              >
                <option value="all">Selecione...</option>
                <option value="01">Janeiro</option>
                <option value="02">Fevereiro</option>
                <option value="03">Março</option>
                <option value="04">Abril</option>
                <option value="05">Maio</option>
                <option value="06">Junho</option>
                <option value="07">Julho</option>
                <option value="08">Agosto</option>
                <option value="09">Setembro</option>
                <option value="10">Outubro</option>
                <option value="11">Novembro</option>
                <option value="12">Dezembro</option>
              </select>
              <select 
                className="input" 
                onChange={(e) => {
                  const y = e.target.value;
                  const m = (document.getElementById('month-select') as HTMLSelectElement).value;
                  if (m !== 'all' && y !== 'all') {
                    const start = new Date(parseInt(y), parseInt(m) - 1, 1);
                    const end = new Date(parseInt(y), parseInt(m), 0);
                    setFilters({ ...filters, startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] });
                  }
                }}
                defaultValue={new Date().getFullYear().toString()}
                id="year-select"
              >
                <option value="all">Selecione...</option>
                {[2024, 2025, 2026, 2027].map(y => (
                  <option key={y} value={y.toString()}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ flex: 2 }}></div>
        </div>
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
              {categories
                .filter(c => !c.parent_id)
                .map(parent => (
                  <optgroup key={parent.id} label={`${parent.name} (${parent.type === 'income' ? 'Receitas' : 'Despesas'})`}>
                    <option value={parent.id}>{parent.name} (Geral)</option>
                    {categories
                      .filter(c => c.parent_id === parent.id)
                      .map(sub => {
                        const children = categories.filter(child => child.parent_id === sub.id);
                        return (
                          <React.Fragment key={sub.id}>
                            <option value={sub.id}>-- {sub.name}</option>
                            {children.map(child => (
                              <option key={child.id} value={child.id}>---- {child.name}</option>
                            ))}
                          </React.Fragment>
                        );
                      })
                    }
                  </optgroup>
                ))
              }
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
          <div className="form-group">
            <label className="form-label">Responsável</label>
            <select className="input" value={filters.responsible} onChange={e => setFilters({ ...filters, responsible: e.target.value as any })}>
              <option value="all">Todos os Responsáveis</option>
              <option value="Clara">Somente Clara</option>
              <option value="Victor">Somente Victor</option>
              <option value="Casa">Somente Casa</option>
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
                  <th>Responsável</th>
                  <th>Valor</th>
                  <th>Tipo</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(t => (
                  <tr key={t.id} style={getRowStyle(t)}>
                    <td>{new Date(t.due_date).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 500 }}>{t.description}</td>
                    <td>{t.entities?.name || '-'}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.categories?.color || '#ccc' }}></div>
                        {(() => {
                          const category = categories.find(c => c.id === t.category_id);
                          const parent = category?.parent_id ? categories.find(c => c.id === category.parent_id) : null;
                          return parent ? `${parent.name} > ${category?.name}` : (category?.name || 'Sem Categoria');
                        })()}
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '4px', 
                        fontSize: '0.75rem',
                        background: t.responsible === 'Victor' ? 'rgba(59, 130, 246, 0.1)' : t.responsible === 'Clara' ? 'rgba(236, 72, 153, 0.1)' : t.responsible === 'Casa' ? 'rgba(107, 114, 128, 0.1)' : 'transparent',
                        color: t.responsible === 'Victor' ? '#3b82f6' : t.responsible === 'Clara' ? '#ec4899' : t.responsible === 'Casa' ? '#6b7280' : 'var(--text-light)',
                        fontWeight: 600
                      }}>
                        {t.responsible || '-'}
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
                    <td style={{ fontWeight: 600 }}>
                      {group.parent_name ? (
                        <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-light)' }}>
                          {group.parent_name} {'> '}
                          <span style={{ fontWeight: 600, color: 'var(--text)' }}>{group.name}</span>
                        </span>
                      ) : group.name}
                    </td>
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
