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
    installments: 1
  });

  const filteredTransactions = transactions.filter(t => t.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addTransaction({
      description: formData.description,
      amount: parseFloat(formData.amount),
      due_date: formData.due_date,
      type,
      category_id: formData.category_id,
      bank_id: formData.bank_id,
      entity_id: formData.entity_id,
      status: 'pending'
    }, formData.installments);
    setIsAdding(false);
    setFormData({
      description: '',
      amount: '',
      due_date: new Date().toISOString().split('T')[0],
      category_id: '',
      bank_id: '',
      entity_id: '',
      installments: 1
    });
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
                        <option value={parent.id}>{parent.name} (Principal)</option>
                        {categories
                          .filter(c => c.parent_id === parent.id)
                          .map(sub => (
                            <option key={sub.id} value={sub.id}>{sub.name}</option>
                          ))
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
              <div className="form-group">
                <label className="form-label">Parcelas</label>
                <input 
                  className="input" 
                  type="number" 
                  min="1" 
                  value={formData.installments} 
                  onChange={e => setFormData({ ...formData, installments: parseInt(e.target.value) })} 
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="button" className="btn" onClick={() => setIsAdding(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Salvar Lançamento</button>
            </div>
          </form>
        </div>
      )}

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
                            <option value={parent.id}>{parent.name} (Principal)</option>
                            {categories
                              .filter(c => c.parent_id === parent.id)
                              .map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                              ))
                            }
                          </optgroup>
                        ))
                      }
                    </select>
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
