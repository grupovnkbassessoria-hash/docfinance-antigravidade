import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { supabase } from '../lib/supabase';
import { Plus, Tag, Pencil, Trash2 } from 'lucide-react';

const Categories: React.FC = () => {
  const { categories, refresh, loading } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: '#94a3b8'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('categories').insert([formData]);
    if (!error) {
      refresh();
      setIsAdding(false);
      setFormData({ name: '', type: 'expense', color: '#94a3b8' });
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Categorias de Movimentação</h1>
          <p style={{ color: 'var(--text-light)' }}>Organize seus lançamentos para uma análise precisa (DRE/Fluxo de Caixa).</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={20} />
          Nova Categoria
        </button>
      </header>

      {isAdding && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 100px', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Nome da Categoria</label>
                <input 
                  className="input" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tipo</label>
                <select 
                  className="input" 
                  value={formData.type} 
                  onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                >
                  <option value="expense">Despesa (Contas a Pagar)</option>
                  <option value="income">Receita (Contas a Receber)</option>
                </select>
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
              <button type="button" className="btn" onClick={() => setIsAdding(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Salvar Categoria</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
            <Tag size={20} /> Receitas
          </h3>
          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.filter(c => c.type === 'income').map(cat => (
                    <tr key={cat.id}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: cat.color }}></div>
                        <span style={{ fontWeight: 500 }}>{cat.name}</span>
                      </td>
                      <td>
                        <button style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', marginRight: '0.5rem' }}><Pencil size={16} /></button>
                        <button style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
            <Tag size={20} /> Despesas
          </h3>
          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.filter(c => c.type === 'expense').map(cat => (
                    <tr key={cat.id}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: cat.color }}></div>
                        <span style={{ fontWeight: 500 }}>{cat.name}</span>
                      </td>
                      <td>
                        <button style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', marginRight: '0.5rem' }}><Pencil size={16} /></button>
                        <button style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
