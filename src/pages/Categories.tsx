import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { supabase } from '../lib/supabase';
import { Plus, Tag, Pencil, Trash2 } from 'lucide-react';

const Categories: React.FC = () => {
  const { categories, refresh, loading } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: '#94a3b8',
    parent_id: '' as string | null,
    new_parent_name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let currentParentId = formData.parent_id;

    // Handle creating a new parent category if requested
    if (formData.parent_id === 'NEW') {
      if (!formData.new_parent_name) {
        alert('Por favor, digite o nome da nova categoria principal.');
        return;
      }

      const { data: newParent, error: parentError } = await supabase
        .from('categories')
        .insert([{
          name: formData.new_parent_name,
          type: formData.type,
          color: formData.color
        }])
        .select()
        .single();

      if (parentError) {
        console.error('Error creating parent category:', parentError);
        alert(`Erro ao criar categoria principal: ${parentError.message}`);
        return;
      }
      currentParentId = newParent.id;
    }

    const data = {
      name: formData.name,
      type: formData.type,
      color: formData.color,
      parent_id: currentParentId || null
    };

    if (editingId) {
      const { error } = await supabase
        .from('categories')
        .update(data)
        .eq('id', editingId);

      if (!error) {
        refresh();
        setIsAdding(false);
        setEditingId(null);
        setFormData({ name: '', type: 'expense', color: '#94a3b8', parent_id: '', new_parent_name: '' });
      } else {
        console.error('Error updating category:', error);
        alert(`Erro ao atualizar categoria: ${error.message || 'Erro desconhecido'}`);
      }
    } else {
      const { error } = await supabase.from('categories').insert([data]);
      if (!error) {
        refresh();
        setIsAdding(false);
        setFormData({ name: '', type: 'expense', color: '#94a3b8', parent_id: '', new_parent_name: '' });
      } else {
        console.error('Error saving category:', error);
        alert(`Erro ao salvar categoria: ${error.message || 'Erro desconhecido'}`);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria? Subcategorias também poderão ser afetadas.')) return;

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (!error) {
      refresh();
    } else {
      console.error('Error deleting category:', error);
      alert(`Erro ao excluir categoria: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const handleEdit = (category: any) => {
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color || '#94a3b8',
      parent_id: category.parent_id || '',
      new_parent_name: ''
    });
    setEditingId(category.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <button 
              onClick={() => handleEdit(parent)}
              style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', marginRight: '0.5rem' }}
            >
              <Pencil size={16} />
            </button>
            <button 
              onClick={() => handleDelete(parent.id)}
              style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
            >
              <Trash2 size={16} />
            </button>
          </td>
        </tr>
        {typeCategories.filter(c => c.parent_id === parent.id).map(sub => (
          <tr key={sub.id}>
            <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '2.5rem' }}>
              <div style={{ width: '8px', height: '2px', background: 'var(--border)' }}></div>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>{sub.name}</span>
            </td>
            <td>
              <button 
                onClick={() => handleEdit(sub)}
                style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', marginRight: '0.5rem' }}
              >
                <Pencil size={14} />
              </button>
              <button 
                onClick={() => handleDelete(sub.id)}
                style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
              >
                <Trash2 size={14} />
              </button>
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
          <h3 style={{ marginBottom: '1.5rem' }}>{editingId ? 'Editar Categoria' : 'Nova Categoria'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: editingId ? '1.5fr 1fr 1fr 100px' : '1.5fr 1fr 1.5fr 100px', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">{formData.parent_id === 'NEW' ? 'Nome da Subcategoria' : 'Nome da Categoria'}</label>
                <input 
                  className="input" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  placeholder={formData.parent_id === 'NEW' ? 'Ex: Cartão Nubank' : ''}
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
                    setFormData({ ...formData, type: newType, parent_id: '', new_parent_name: '' });
                  }}
                >
                  <option value="expense">Despesa (Contas a Pagar)</option>
                  <option value="income">Receita (Contas a Receber)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Subcategoria de (Opcional)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <select 
                    className="input" 
                    value={formData.parent_id || ''} 
                    onChange={e => setFormData({ ...formData, parent_id: e.target.value || null, new_parent_name: '' })}
                  >
                    <option value="">Nenhuma (Categoria Principal)</option>
                    {!editingId && <option value="NEW" style={{ fontWeight: 'bold', color: 'var(--primary)' }}>+ Criar Nova Categoria Principal</option>}
                    {categories
                      .filter(c => c.type === formData.type && !c.parent_id && c.id !== editingId)
                      .map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))
                    }
                  </select>
                  {formData.parent_id === 'NEW' && (
                    <input 
                      className="input animate-fade-in" 
                      style={{ border: '2px solid var(--primary)' }}
                      value={formData.new_parent_name}
                      onChange={e => setFormData({ ...formData, new_parent_name: e.target.value })}
                      placeholder="Nome da Categoria Principal (Ex: Cartão de Crédito)"
                      required
                    />
                  )}
                </div>
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
              <button 
                type="button" 
                className="btn" 
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  setFormData({ name: '', type: 'expense', color: '#94a3b8', parent_id: '', new_parent_name: '' });
                }}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Atualizar Categoria' : 'Salvar Categoria'}
              </button>
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
