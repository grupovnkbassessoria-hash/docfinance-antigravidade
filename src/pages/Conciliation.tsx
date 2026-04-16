import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { Upload, Check, AlertTriangle, FileText } from 'lucide-react';

const Conciliation: React.FC = () => {
  const { transactions, banks, addTransaction, updateTransactionStatus } = useFinance();
  const [ofxTransactions, setOfxTransactions] = useState<any[]>([]);
  const [matchingResults, setMatchingResults] = useState<any[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      parseOFX(content);
    };
    reader.readAsText(file);
  };

  const parseOFX = (content: string) => {
    // Basic regex-based OFX parser for STMTTRN blocks
    const trnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/g;
    const matches = [...content.matchAll(trnRegex)];
    
    const parsed = matches.map(m => {
      const block = m[1];
      const getTagValue = (tag: string) => {
        const regex = new RegExp(`<${tag}>([^<\\n]*)`, 'i');
        return block.match(regex)?.[1]?.trim() || '';
      };

      const dateStr = getTagValue('DTPOSTED');
      // Format YYYYMMDD
      const date = dateStr ? `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}` : '';
      
      return {
        fitid: getTagValue('FITID'),
        type: getTagValue('TRNTYPE'),
        date,
        amount: parseFloat(getTagValue('TRNAMT').replace(',', '.')),
        memo: getTagValue('MEMO') || getTagValue('NAME'),
      };
    });

    setOfxTransactions(parsed);
    matchTransactions(parsed);
  };

  const matchTransactions = (ofxItems: any[]) => {
    const results = ofxItems.map(item => {
      // Look for a transaction with same amount and roughly same date
      const match = transactions.find(t => 
        Math.abs(Number(t.amount)) === Math.abs(item.amount) && 
        t.status === 'pending'
      );
      return { ofx: item, match };
    });
    setMatchingResults(results);
  };

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Conciliação Bancária</h1>
        <p style={{ color: 'var(--text-light)' }}>Importe seu arquivo OFX e concilie seus lançamentos.</p>
      </header>

      <div className="card" style={{ marginBottom: '2rem', textAlign: 'center', padding: '3rem' }}>
        <input 
          type="file" 
          id="ofx-upload" 
          accept=".ofx" 
          style={{ display: 'none' }} 
          onChange={handleFileUpload}
        />
        <label htmlFor="ofx-upload" className="btn btn-primary" style={{ cursor: 'pointer' }}>
          <Upload size={20} />
          Selecionar Arquivo OFX
        </label>
        <p style={{ marginTop: '1rem', color: 'var(--text-light)', fontSize: '0.875rem' }}>
          Formatos aceitos: .ofx (Extrato Bancário)
        </p>
      </div>

      {matchingResults.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Transações Identificadas</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Data OFX</th>
                  <th>Descrição OFX</th>
                  <th>Valor</th>
                  <th>Sugestão de Conciliação</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {matchingResults.map((res, idx) => (
                  <tr key={idx}>
                    <td>{new Date(res.ofx.date).toLocaleDateString()}</td>
                    <td>{res.ofx.memo}</td>
                    <td style={{ fontWeight: 700 }}>
                      R$ {res.ofx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      {res.match ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
                          <Check size={16} />
                          <span>{res.match.description} ({new Date(res.match.due_date).toLocaleDateString()})</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)' }}>
                          <AlertTriangle size={16} />
                          <span>Nenhum correspondente encontrado</span>
                        </div>
                      )}
                    </td>
                    <td>
                      {res.match ? (
                        <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                          Conciliar
                        </button>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', border: '1px solid var(--border)' }}>
                            Criar Novo
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Conciliation;
