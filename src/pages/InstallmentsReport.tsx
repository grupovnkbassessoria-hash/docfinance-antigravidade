import React, { useState, useMemo } from 'react';
import { useFinance } from '../hooks/useFinance';
import type { Transaction } from '../hooks/useFinance';
import { Layers, Calendar, ArrowUpCircle, ArrowDownCircle, Search } from 'lucide-react';

const InstallmentsReport: React.FC = () => {
  const { transactions, loading } = useFinance();
  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 3, new Date().getDate()).toISOString().split('T')[0],
    type: 'all' as 'all' | 'payable' | 'receivable'
  });

  const groupedInstallments = useMemo(() => {
    const groups: Record<string, {
      description: string,
      entity: string,
      type: string,
      total_installments: number,
      paid_count: number,
      pending_count: number,
      total_amount: number,
      amount_paid: number,
      amount_pending: number,
      next_due_date: string | null,
      installments: Transaction[]
    }> = {};

    transactions.forEach(t => {
      if (filters.type !== 'all' && t.type !== filters.type) return;

      const groupId = t.parent_id || t.id;
      if (!groups[groupId]) {
        groups[groupId] = {
          description: t.description,
          entity: t.entities?.name || 'Vários/Outros',
          type: t.type,
          total_installments: t.total_installments || 1,
          paid_count: 0,
          pending_count: 0,
          total_amount: 0,
          amount_paid: 0,
          amount_pending: 0,
          next_due_date: null,
          installments: []
        };
      }

      groups[groupId].total_amount += Number(t.amount);
      groups[groupId].installments.push(t);

      if (t.status === 'paid') {
        groups[groupId].paid_count += 1;
        groups[groupId].amount_paid += Number(t.amount);
      } else {
        groups[groupId].pending_count += 1;
        groups[groupId].amount_pending += Number(t.amount);
        if (!groups[groupId].next_due_date || t.due_date < groups[groupId].next_due_date) {
            groups[groupId].next_due_date = t.due_date;
        }
      }
    });

    // Filter by period (if next_due_date or any installment falls in period)
    return Object.values(groups).filter(g => {
        if (g.total_installments === 1 && g.paid_count > 0) return false; // Hide simple paid items
        const hasInstallmentInPeriod = g.installments.some(inst => 
            inst.due_date >= filters.startDate && inst.due_date <= filters.endDate
        );
        return hasInstallmentInPeriod;
    });
  }, [transactions, filters]);

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Relatório de Parcelamentos</h1>
          <p style={{ color: 'var(--text-light)' }}>Veja o progresso de pagamentos e parcelas restantes por período.</p>
        </div>
      </header>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1.5rem', alignItems: 'flex-end' }}>
          <div className="form-group">
            <label className="form-label">Período Inicial</label>
            <input type="date" className="input" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Período Final</label>
            <input type="date" className="input" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Tipo de Conta</label>
            <select className="input" value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value as any })}>
              <option value="all">Todas</option>
              <option value="payable">Contas a Pagar</option>
              <option value="receivable">Contas a Receber</option>
            </select>
          </div>
          <div style={{ paddingBottom: '1.25rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--background)', color: 'var(--primary)' }}>
              <Search size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Descrição / Entidade</th>
                <th>Tipo</th>
                <th>Parcelas (Pagas/Total)</th>
                <th>Restantes</th>
                <th>Vlr Restante</th>
                <th>Próximo Venc.</th>
                <th>Status Geral</th>
              </tr>
            </thead>
            <tbody>
              {groupedInstallments.map((group, idx) => (
                <tr key={idx}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{group.description}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{group.entity}</div>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: group.type === 'receivable' ? 'var(--accent)' : 'var(--danger)' }}>
                      {group.type === 'receivable' ? <ArrowUpCircle size={14} /> : <ArrowDownCircle size={14} />}
                      {group.type === 'receivable' ? 'Entrada' : 'Saída'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ flex: 1, height: '6px', background: 'var(--background)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${(group.paid_count / group.total_installments) * 100}%`, 
                          height: '100%', 
                          background: group.type === 'receivable' ? 'var(--accent)' : 'var(--primary)' 
                        }}></div>
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{group.paid_count}/{group.total_installments}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700 }}>{group.pending_count}</span>
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    R$ {group.amount_pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    {group.next_due_date ? new Date(group.next_due_date).toLocaleDateString() : 'Nenhum'}
                  </td>
                  <td>
                    <span className={`status-badge status-${group.pending_count === 0 ? 'paid' : 'pending'}`}>
                      {group.pending_count === 0 ? 'Finalizado' : 'Em Aberto'}
                    </span>
                  </td>
                </tr>
              ))}
              {groupedInstallments.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
                    Nenhum parcelamento encontrado para o período selecionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InstallmentsReport;
