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
    color: '#94a3b8',
    parent_id: '' as string | null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToInsert = {
      ...formData,
      parent_id: formData.parent_id || null
    };
    const { error } = await supabase.from('categories').insert([dataToInsert]);
    if (!error) {
      refresh();
      setIsAdding(false);
      setFormData({ name: '', type: 'expense', color: '#94a3b8', parent_id: '' });
    }
  };

  if (loading) return <div>Carregando...</div>;

  const renderCategoryRows = (type: 'income' | 'expense') => {
    const typeCategories = categories.filter(c => c.type === type);
    const parents = typeCategories.filter(c => !c.parent_id);
    
    return parents.map(parent => (
      <React.Fragment key={parent.id}>
        <tr>
          <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: parent.color }}></div>
            <span style={{ fontWeight: 600 }}>{parent.name}</span>
          </td>
          <td>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', marginRight: '0.5rem' }}><Pencil size={16} /></button>
            <button style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={16} /></button>
          </td>
        </tr>
        {typeCategories.filter(c => c.parent_id === parent.id).map(sub => (
          <tr key={sub.id}>
            <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '2.5rem' }}>
              <div style={{ width: '8px', height: '2px', background: 'var(--border)' }}></div>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>{sub.name}</span>
            </td>
            <td>
              <button style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', marginRight: '0.5rem' }}><Pencil size={14} /></button>
              <button style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={14} /></button>
            </td>
          </tr>
        ))}
      </React.Fragment>
    ));
  };

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Categorias de Movimentação</h1>
          <p style={{ color: 'var(--text-light)' }}>Organize seus lançamentos com categorias e subcategorias.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={20} />
          Nova Categoria
        </button>
      </header>

      {isAdding && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 100px', gap: '1rem', marginBottom: '1.5rem' }}>
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
                  onChange={e => {
                    const newType = e.target.value as any;
                    setFormData({ ...formData, type: newType, parent_id: '' });
                  }}
                >
                  <option value="expense">Despesa (Contas a Pagar)</option>
                  <option value="income">Receita (Contas a Receber)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Subcategoria de (Opcional)</label>
                <select 
                  className="input" 
                  value={formData.parent_id || ''} 
                  onChange={e => setFormData({ ...formData, parent_id: e.target.value || null })}
                >
                  <option value="">Nenhuma (Categoria Principal)</option>
                  {categories
                    .filter(c => c.type === formData.type && !c.parent_id)
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  }
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
                  {renderCategoryRows('income')}
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
                  {renderCategoryRows('expense')}
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
