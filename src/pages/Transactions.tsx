import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { Plus, Check } from 'lucide-react';

interface Props {
  type: 'payable' | 'receivable';
}

const Transactions: React.FC<Props> = ({ type }) => {
  const { 
    transactions, 
    banks, 
    categories, 
    entities, 
    addTransaction, 
    updateTransactionStatus, 
    updateTransaction,
    loading 
  } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    due_date: new Date().toISOString().split('T')[0],
    category_id: '',
    bank_id: '',
    entity_id: '',
    installments: 1,
    responsible: 'Clara' as 'Clara' | 'Victor',
    entryType: 'single' as 'single' | 'installments' | 'fixed'
  });

  const [listFilter, setListFilter] = useState({
    responsible: 'all' as 'all' | 'Clara' | 'Victor'
  });
  const filteredTransactions = transactions.filter(t => {
    const matchesType = t.type === type;
    const matchesResponsible = listFilter.responsible === 'all' || t.responsible === listFilter.responsible;
    return matchesType && matchesResponsible;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await addTransaction({
      description: formData.description,
      amount: parseFloat(formData.amount),
      due_date: formData.due_date,
      type,
      category_id: formData.category_id,
      bank_id: formData.bank_id,
      entity_id: formData.entity_id,
      responsible: formData.responsible,
      status: 'pending'
    }, formData.installments, formData.entryType === 'fixed');
    
    if (error) {
      console.error('Error saving transaction:', error);
      alert(`Erro ao salvar lançamento: ${error.message || 'Erro desconhecido'}`);
    } else {
      setIsAdding(false);
      setFormData({
        description: '',
        amount: '',
        due_date: new Date().toISOString().split('T')[0],
        category_id: '',
        bank_id: '',
        entity_id: '',
        installments: 1,
        responsible: 'Clara',
        entryType: 'single'
      });
    }
  };

  const handleCategoryChange = async (id: string, category_id: string) => {
    await updateTransaction(id, { category_id });
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>
            {type === 'payable' ? 'Contas a Pagar' : 'Contas a Receber'}
          </h1>
          <p style={{ color: 'var(--text-light)' }}>Gerencie suas contas e lançamentos.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={20} />
          Novo Lançamento
        </button>
      </header>

      {isAdding && (
        <div className="card" style={{ marginBottom: '2rem', border: '2px solid var(--primary)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Descrição</label>
                <input 
                  className="input" 
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Valor</label>
                <input 
                  className="input" 
                  type="number" 
                  value={formData.amount} 
                  onChange={e => setFormData({ ...formData, amount: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Vencimento</label>
                <input 
                  className="input" 
                  type="date" 
                  value={formData.due_date} 
                  onChange={e => setFormData({ ...formData, due_date: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Categoria</label>
                <select 
                  className="input" 
                  value={formData.category_id} 
                  onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                  required
                >
                  <option value="">Selecione...</option>
                  {categories
                    .filter(c => c.type === (type === 'payable' ? 'expense' : 'income') && !c.parent_id)
                    .map(parent => (
                      <optgroup key={parent.id} label={parent.name}>
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
                <label className="form-label">Banco/Conta</label>
                <select 
                  className="input" 
                  value={formData.bank_id} 
                  onChange={e => setFormData({ ...formData, bank_id: e.target.value })}
                  required
                >
                  <option value="">Selecione...</option>
                  {banks.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{type === 'payable' ? 'Fornecedor' : 'Cliente'}</label>
                <select 
                  className="input" 
                  value={formData.entity_id} 
                  onChange={e => setFormData({ ...formData, entity_id: e.target.value })}
                  required
                >
                  <option value="">Selecione...</option>
                  {entities.filter(ent => ent.type === (type === 'payable' ? 'supplier' : 'customer')).map(ent => (
                    <option key={ent.id} value={ent.id}>{ent.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: 'span 3' }}>
                <label className="form-label">Tipo de Lançamento</label>
                <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="entryType" 
                      checked={formData.entryType === 'single'} 
                      onChange={() => setFormData({ ...formData, entryType: 'single', installments: 1 })} 
                    /> Único
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="entryType" 
                      checked={formData.entryType === 'installments'} 
                      onChange={() => setFormData({ ...formData, entryType: 'installments' })} 
                    /> Parcelado
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="entryType" 
                      checked={formData.entryType === 'fixed'} 
                      onChange={() => setFormData({ ...formData, entryType: 'fixed' })} 
                    /> Fixo Mensal
                  </label>
                </div>
              </div>
              
              {formData.entryType !== 'single' && (
                <div className="form-group">
                  <label className="form-label">
                    {formData.entryType === 'installments' ? 'Número de Parcelas' : 'Número de Meses (Repetir)'}
                  </label>
                  <input 
                    className="input" 
                    type="number" 
                    min="2" 
                    value={formData.installments} 
                    onChange={e => setFormData({ ...formData, installments: parseInt(e.target.value) })} 
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                    {formData.entryType === 'fixed' 
                      ? 'O valor total será lançado integralmente em cada mês.' 
                      : 'O valor total será dividido entre as parcelas.'}
                  </p>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Responsável</label>
                <select 
                  className="input" 
                  value={formData.responsible} 
                  onChange={e => setFormData({ ...formData, responsible: e.target.value as 'Clara' | 'Victor' })}
                  required
                >
                  <option value="Clara">Clara</option>
                  <option value="Victor">Victor</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="button" className="btn" onClick={() => setIsAdding(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Salvar Lançamento</button>
            </div>
          </form>
        </div>
      )}
      <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label className="form-label" style={{ marginBottom: 0 }}>Filtrar por Responsável:</label>
          <select 
            className="input" 
            style={{ width: 'auto' }}
            value={listFilter.responsible}
            onChange={e => setListFilter({ ...listFilter, responsible: e.target.value as any })}
          >
            <option value="all">Todos</option>
            <option value="Clara">Clara</option>
            <option value="Victor">Victor</option>
          </select>
        </div>
      </div>
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Vencimento</th>
                <th>Descrição</th>
                <th>{type === 'payable' ? 'Fornecedor' : 'Cliente'}</th>
                <th>Categoria</th>
                <th>Responsável</th>
                <th>Parcelas</th>
                <th>Valor</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(t => (
                <tr key={t.id}>
                  <td>
                    <span style={{ 
                      padding: '0.25rem 0.625rem', 
                      borderRadius: '100px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      background: t.status === 'paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: t.status === 'paid' ? 'var(--accent)' : 'var(--warning)'
                    }}>
                      {t.status === 'paid' ? 'Pago' : 'Pendente'}
                    </span>
                  </td>
                  <td>{new Date(t.due_date).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 500 }}>{t.description}</td>
                  <td>{t.entities?.name || '-'}</td>
                  <td>
                    <select 
                      className="input" 
                      style={{ padding: '0.2rem', fontSize: '0.75rem', border: 'none', background: 'var(--bg-light)' }}
                      value={t.category_id || ''}
                      onChange={(e) => handleCategoryChange(t.id, e.target.value)}
                    >
                      <option value="">Sem Categoria</option>
                      {categories
                        .filter(c => c.type === (type === 'payable' ? 'expense' : 'income') && !c.parent_id)
                        .map(parent => (
                          <optgroup key={parent.id} label={parent.name}>
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
                  </td>
                  <td>
                    <span style={{ 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem',
                      background: t.responsible === 'Victor' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(236, 72, 153, 0.1)',
                      color: t.responsible === 'Victor' ? '#3b82f6' : '#ec4899',
                      fontWeight: 600
                    }}>
                      {t.responsible || '-'}
                    </span>
                  </td>
                  <td>{t.installment_number} / {t.total_installments}</td>
                  <td style={{ fontWeight: 700 }}>
                    R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    {t.status === 'pending' && (
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '0.4rem', borderRadius: '50%' }}
                        onClick={() => updateTransactionStatus(t.id, 'paid')}
                        title="Marcar como Pago"
                      >
                        <Check size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
