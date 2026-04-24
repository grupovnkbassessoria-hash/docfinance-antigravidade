import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { supabase } from '../lib/supabase';
import { Plus, Landmark, Pencil, Trash2 } from 'lucide-react';

const Banks: React.FC = () => {
  const { banks, refresh, loading } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    account_number: '',
    initial_balance: 0,
    color: '#3b82f6'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      const { error } = await supabase
        .from('banks')
        .update({
          name: formData.name,
          account_number: formData.account_number,
          initial_balance: formData.initial_balance,
          color: formData.color
        })
        .eq('id', editingId);
      
      if (!error) {
        refresh();
        setEditingId(null);
        setFormData({ name: '', account_number: '', initial_balance: 0, color: '#3b82f6' });
      } else {
        console.error('Error updating bank:', error);
        alert(`Erro ao atualizar conta: ${error.message || 'Erro desconhecido'}`);
      }
    } else {
      const { error } = await supabase.from('banks').insert([{
        ...formData,
        current_balance: formData.initial_balance
      }]);
      
      if (!error) {
        refresh();
        setIsAdding(false);
        setFormData({ name: '', account_number: '', initial_balance: 0, color: '#3b82f6' });
      } else {
        console.error('Error saving bank:', error);
        alert(`Erro ao salvar conta: ${error.message || 'Erro desconhecido'}`);
      }
    }
  };

  const startEdit = (bank: any) => {
    setEditingId(bank.id);
    setFormData({
      name: bank.name,
      account_number: bank.account_number || '',
      initial_balance: bank.initial_balance || 0,
      color: bank.color
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conta bancária?')) return;

    const { error } = await supabase
      .from('banks')
      .delete()
      .eq('id', id);

    if (!error) {
      refresh();
    } else {
      console.error('Error deleting bank:', error);
      alert(`Erro ao excluir conta: ${error.message || 'Erro desconhecido'}`);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Bancos e Contas</h1>
          <p style={{ color: 'var(--text-light)' }}>Gerencie suas contas bancárias e saldos iniciais.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ name: '', account_number: '', initial_balance: 0, color: '#3b82f6' }); }}>
          <Plus size={20} />
          Nova Conta
        </button>
      </header>

      {isAdding && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>{editingId ? 'Editar Conta' : 'Nova Conta'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Nome do Banco</label>
                <input 
                  className="input" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Número da Conta</label>
                <input 
                  className="input" 
                  value={formData.account_number} 
                  onChange={e => setFormData({ ...formData, account_number: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Saldo Inicial</label>
                <input 
                  className="input" 
                  type="number" 
                  step="0.01"
                  value={formData.initial_balance} 
                  onChange={e => setFormData({ ...formData, initial_balance: parseFloat(e.target.value) })} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Cor</label>
                <input 
                  type="color" 
                  className="input" 
                  style={{ height: '42px', padding: '2px' }}
                  value={formData.color} 
                  onChange={e => setFormData({ ...formData, color: e.target.value })} 
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn" onClick={() => { setIsAdding(false); setEditingId(null); }}>Cancelar</button>
              <button type="submit" className="btn btn-primary">{editingId ? 'Atualizar Conta' : 'Salvar Conta'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="stats-grid">
        {banks.map(bank => (
          <div key={bank.id} className="card" style={{ borderLeft: `6px solid ${bank.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Landmark size={20} style={{ color: bank.color }} />
                  <span style={{ fontWeight: 600 }}>{bank.name}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '1rem' }}>
                  CC: {bank.account_number || 'N/A'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => startEdit(bank)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }}
                >
                  <Pencil size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(bank.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              R$ {Number(bank.current_balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
              <span>Saldo Atual</span>
              <span style={{ opacity: 0.7 }}>Inicial: R$ {Number(bank.initial_balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Banks;
