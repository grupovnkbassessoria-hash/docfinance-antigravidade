import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Download, Database, ShieldCheck, AlertCircle } from 'lucide-react';

const Backup: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  const handleBackup = async () => {
    setLoading(true);
    try {
      const tables = [
        'banks',
        'categories',
        'entities',
        'transactions',
        'fin_invoices',
        'fin_invoice_items'
      ];

      const backupData: Record<string, any> = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {}
      };

      for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*');
        if (error) {
          console.error(`Error backing up table ${table}:`, error);
          throw error;
        }
        backupData.data[table] = data;
      }

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-appclara-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setLastBackup(new Date().toLocaleString());
      alert('Backup realizado com sucesso!');
    } catch (error: any) {
      console.error('Backup failed:', error);
      alert(`Falha no backup: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Backup do Sistema</h1>
        <p style={{ color: 'var(--text-light)' }}>Exporte todos os seus dados para segurança externa.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <Database size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Exportar Dados</h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-light)' }}>Gera um arquivo JSON com todas as informações.</p>
            </div>
          </div>

          <div style={{ padding: '1.5rem', background: 'var(--background)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-light)', lineHeight: 1.6 }}>
              <li>Contas Bancárias e Saldos</li>
              <li>Categorias e Subcategorias</li>
              <li>Clientes e Fornecedores</li>
              <li>Todos os Lançamentos Financeiros</li>
              <li>Faturas e Itens de Fatura</li>
            </ul>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem' }} 
            onClick={handleBackup}
            disabled={loading}
          >
            <Download size={20} />
            {loading ? 'Gerando Arquivo...' : 'Baixar Backup Agora'}
          </button>

          {lastBackup && (
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--accent)', marginTop: '1rem', fontWeight: 600 }}>
              <ShieldCheck size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              Último backup realizado em: {lastBackup}
            </p>
          )}
        </div>

        <div className="card" style={{ border: '1px dashed var(--border)', background: 'transparent' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', opacity: 0.7 }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(107, 114, 128, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Por que fazer backup?</h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-light)' }}>Segurança e tranquilidade para o seu negócio.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <AlertCircle size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-light)' }}>
                <strong>Segurança de Dados:</strong> Embora seus dados estejam seguros na nuvem, ter uma cópia local é uma prática recomendada de compliance.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <AlertCircle size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-light)' }}>
                <strong>Portabilidade:</strong> Você pode usar este arquivo para migrar dados ou realizar auditorias externas em planilhas.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <AlertCircle size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-light)' }}>
                <strong>Histórico:</strong> Guarde backups mensais para ter um histórico offline da sua evolução financeira.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Backup;
