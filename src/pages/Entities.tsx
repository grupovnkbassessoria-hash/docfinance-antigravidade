import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { supabase } from '../lib/supabase';
import { Plus, Mail, Phone, Hash } from 'lucide-react';

interface Props {
  type: 'customer' | 'supplier';
}

const Entities: React.FC<Props> = ({ type }) => {
  const { entities, refresh, loading } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    email: '',
    phone: ''
  });

  const filteredEntities = entities.filter(e => e.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const { error } = await supabase.from('entities')
        .update(formData)
        .eq('id', editingId);
      
      if (!error) {
        refresh();
        setIsAdding(false);
        setEditingId(null);
        setFormData({ name: '', document: '', email: '', phone: '' });
      } else {
        console.error('Error updating entity:', error);
        alert(`Erro ao atualizar cadastro: ${error.message || 'Erro desconhecido'}`);
      }
    } else {
      const { error } = await supabase.from('entities').insert([{
        ...formData,
        type
      }]);
      
      if (!error) {
        refresh();
        setIsAdding(false);
        setFormData({ name: '', document: '', email: '', phone: '' });
      } else {
        console.error('Error saving entity:', error);
        alert(`Erro ao salvar cadastro: ${error.message || 'Erro desconhecido'}`);
      }
    }
  };

  const handleEdit = (ent: any) => {
    setFormData({
      name: ent.name || '',
      document: ent.document || '',
      email: ent.email || '',
      phone: ent.phone || ''
    });
    setEditingId(ent.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Tem certeza que deseja excluir este ${type === 'customer' ? 'cliente' : 'fornecedor'}?`)) return;

    const { error } = await supabase
      .from('entities')
      .delete()
      .eq('id', id);

    if (!error) {
      refresh();
    } else {
      console.error('Error deleting entity:', error);
      alert(`Erro ao excluir cadastro: ${error.message || 'Erro desconhecido'}`);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>
            {type === 'customer' ? 'Clientes' : 'Fornecedores'}
          </h1>
          <p style={{ color: 'var(--text-light)' }}>Gerencie o cadastro de {type === 'customer' ? 'seus clientes' : 'seus fornecedores'}.</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setEditingId(null);
          setFormData({ name: '', document: '', email: '', phone: '' });
          setIsAdding(true);
        }}>
          <Plus size={20} />
          Novo Cadastro
        </button>
      </header>

      {isAdding && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>{editingId ? 'Editar Cadastro' : 'Novo Cadastro'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Nome / Razão Social</label>
                <input 
                  className="input" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">CPF / CNPJ</label>
                <input 
                  className="input" 
                  value={formData.document} 
                  onChange={e => setFormData({ ...formData, document: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input 
                  className="input" 
                  type="email"
                  value={formData.email} 
                  onChange={e => setFormData({ ...formData, email: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Telefone</label>
                <input 
                  className="input" 
                  value={formData.phone} 
                  onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="button" className="btn" onClick={() => { setIsAdding(false); setEditingId(null); }}>Cancelar</button>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Atualizar Cadastro' : 'Salvar Cadastro'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Documento</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntities.map(ent => (
                <tr key={ent.id}>
                  <td style={{ fontWeight: 600 }}>{ent.name}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Hash size={14} color="var(--text-light)" />
                      {ent.document || '---'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Mail size={14} color="var(--text-light)" />
                      {ent.email || '---'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={14} color="var(--text-light)" />
                      {ent.phone || '---'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleEdit(ent)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }}
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(ent.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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

export default Entities;
