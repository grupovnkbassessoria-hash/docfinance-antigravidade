import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import type { InvoiceItem } from '../hooks/useFinance';

import { Plus, Check, Trash2, Send } from 'lucide-react';

const Invoices: React.FC = () => {
  const { invoices, entities, categories, createInvoice, billInvoice, loading } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    entity_id: '',
    category_id: '',
    due_date: new Date().toISOString().split('T')[0],
    observations: '',
  });
  const [items, setItems] = useState<Partial<InvoiceItem>[]>([
    { description: '', quantity: 1, unit_price: 0, total_price: 0 }
  ]);

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0, total_price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_price') {
      item.total_price = (item.quantity || 0) * (item.unit_price || 0);
    }
    
    newItems[index] = item;
    setItems(newItems);
  };

  const totalAmount = items.reduce((acc, item) => acc + (item.total_price || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createInvoice(
      { ...formData, total_amount: totalAmount, status: 'draft' },
      items as any[]
    );
    setIsAdding(false);
    setFormData({ entity_id: '', category_id: '', due_date: new Date().toISOString().split('T')[0], observations: '' });
    setItems([{ description: '', quantity: 1, unit_price: 0, total_price: 0 }]);
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Faturamento</h1>
          <p style={{ color: 'var(--text-light)' }}>Emissão de faturas e integração com Contas a Receber.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={20} />
          Nova Fatura
        </button>
      </header>

      {isAdding && (
        <div className="card" style={{ marginBottom: '2rem', border: '2px solid var(--primary)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Cliente</label>
                <select 
                  className="input" 
                  value={formData.entity_id} 
                  onChange={e => setFormData({ ...formData, entity_id: e.target.value })}
                  required
                >
                  <option value="">Selecione o Cliente...</option>
                  {entities.filter(ent => ent.type === 'customer').map(ent => (
                    <option key={ent.id} value={ent.id}>{ent.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Categoria de Receita</label>
                <select 
                  className="input" 
                  value={formData.category_id} 
                  onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                  required
                >
                  <option value="">Selecione a Categoria...</option>
                  {categories
                    .filter(c => c.type === 'income' && !c.parent_id)
                    .map(parent => (
                      <optgroup key={parent.id} label={parent.name}>
                        <option value={parent.id}>{parent.name} (Geral)</option>
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
                <label className="form-label">Vencimento da Fatura</label>
                <input 
                  className="input" 
                  type="date" 
                  value={formData.due_date} 
                  onChange={e => setFormData({ ...formData, due_date: e.target.value })} 
                  required 
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>Itens da Fatura</h4>
              {items.map((item, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 100px 150px 150px 50px', gap: '1rem', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Descrição</label>
                    <input 
                      className="input" 
                      value={item.description} 
                      onChange={e => handleItemChange(index, 'description', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Qtd</label>
                    <input 
                      className="input" 
                      type="number"
                      value={item.quantity} 
                      onChange={e => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Preço Unit.</label>
                    <input 
                      className="input" 
                      type="number"
                      step="0.01"
                      value={item.unit_price} 
                      onChange={e => handleItemChange(index, 'unit_price', parseFloat(e.target.value))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total</label>
                    <input className="input" value={item.total_price?.toFixed(2)} disabled />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveItem(index)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', marginBottom: '1.25rem', cursor: 'pointer' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button type="button" className="btn" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }} onClick={handleAddItem}>
                <Plus size={16} /> Adicionar Item
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Observações</label>
              <textarea 
                className="input" 
                style={{ height: '80px', resize: 'vertical' }}
                value={formData.observations} 
                onChange={e => setFormData({ ...formData, observations: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                Total Geral: R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn" onClick={() => setIsAdding(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar como Rascunho</button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nº</th>
                <th>Cliente</th>
                <th>Data Emissão</th>
                <th>Vencimento</th>
                <th>Valor Total</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 600 }}>#{inv.invoice_number}</td>
                  <td>{inv.entities?.name}</td>
                  <td>{new Date(inv.issue_date).toLocaleDateString()}</td>
                  <td>{new Date(inv.due_date).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 700 }}>
                    R$ {Number(inv.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <span style={{ 
                      padding: '0.25rem 0.625rem', 
                      borderRadius: '100px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      background: inv.status === 'billed' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                      color: inv.status === 'billed' ? 'var(--primary)' : 'var(--text-light)'
                    }}>
                      {inv.status === 'billed' ? 'Faturado' : 'Rascunho'}
                    </span>
                  </td>
                  <td>
                    {inv.status === 'draft' && (
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                        onClick={() => billInvoice(inv.id)}
                      >
                        <Send size={14} /> Faturar
                      </button>
                    )}
                    {inv.status === 'billed' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontSize: '0.875rem' }}>
                        <Check size={16} /> Integrado
                      </div>
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

export default Invoices;
