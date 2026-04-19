import React, { useState, useEffect } from 'react';
import { useFinance } from '../hooks/useFinance';
import { Upload, Check, AlertTriangle } from 'lucide-react';

const Conciliation: React.FC = () => {
  const { 
    transactions, 
    categories, 
    banks, 
    entities, 
    addTransaction, 
    updateTransactionStatus, 
    updateTransaction 
  } = useFinance();
  const [ofxTransactionsRows, setOfxTransactionsRows] = useState<any[]>([]);
  const [matchingResults, setMatchingResults] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Record<number, string>>({});
  const [selectedEntities, setSelectedEntities] = useState<Record<number, string>>({});
  const [rowBanks, setRowBanks] = useState<Record<number, string>>({});

  useEffect(() => {
    if (ofxTransactionsRows.length > 0) {
      matchTransactions(ofxTransactionsRows);
    }
  }, [selectedBank, transactions]);

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
    const trnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/g;
    const matches = [...content.matchAll(trnRegex)];
    
    const parsed = matches.map(m => {
      const block = m[1];
      const getTagValue = (tag: string) => {
        const regex = new RegExp(`<${tag}>([^<\\n]*)`, 'i');
        return block.match(regex)?.[1]?.trim() || '';
      };

      const dateStr = getTagValue('DTPOSTED');
      const date = dateStr ? `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}` : '';
      
      return {
        fitid: getTagValue('FITID'),
        type: getTagValue('TRNTYPE'),
        date,
        amount: parseFloat(getTagValue('TRNAMT').replace(',', '.')),
        memo: getTagValue('MEMO') || getTagValue('NAME'),
      };
    });

    setOfxTransactionsRows(parsed);
    matchTransactions(parsed);
  };

  const matchTransactions = (ofxItems: any[]) => {
    const results = ofxItems.map(item => {
      const match = transactions.find(t => 
        Math.abs(Number(t.amount)) === Math.abs(item.amount) && 
        t.status === 'pending' &&
        (selectedBank ? t.bank_id === selectedBank : true)
      );
      return { ofx: item, match };
    });
    setMatchingResults(results);
  };

  const handleMatchConciliation = async (idx: number) => {
    const res = matchingResults[idx];
    if (!res.match) return;

    const { error } = await updateTransactionStatus(res.match.id, 'paid', res.ofx.date);
    if (!error) {
      await updateTransaction(res.match.id, { ofx_transaction_id: res.ofx.fitid });
      const newResults = [...matchingResults];
      newResults.splice(idx, 1);
      setMatchingResults(newResults);
    }
  };

  const handleCreateAndConciliate = async (idx: number) => {
    const res = matchingResults[idx];
    const categoryId = selectedCategories[idx];
    const entityId = selectedEntities[idx];
    const bankId = rowBanks[idx] || selectedBank;

    if (!categoryId) {
      alert('Selecione uma categoria para este lançamento.');
      return;
    }

    if (!bankId) {
      alert('Selecione um banco para este lançamento.');
      return;
    }

    const type = res.ofx.amount > 0 ? 'receivable' : 'payable';

    const { error } = await addTransaction({
      description: res.ofx.memo,
      amount: Math.abs(res.ofx.amount),
      due_date: res.ofx.date,
      payment_date: res.ofx.date,
      status: 'paid',
      type,
      category_id: categoryId,
      entity_id: entityId || null,
      bank_id: bankId,
      ofx_transaction_id: res.ofx.fitid
    });

    if (!error) {
      const newResults = [...matchingResults];
      newResults.splice(idx, 1);
      setMatchingResults(newResults);
    }
  };

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Conciliação Bancária</h1>
        <p style={{ color: 'var(--text-light)' }}>Importe seu arquivo OFX e concilie seus lançamentos.</p>
      </header>

      <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'center' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Selecione a Conta Bancária</label>
            <select 
              className="input" 
              value={selectedBank} 
              onChange={e => setSelectedBank(e.target.value)}
            >
              <option value="">Selecione...</option>
              {banks.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div style={{ textAlign: 'center' }}>
            <input 
              type="file" 
              id="ofx-upload" 
              accept=".ofx" 
              style={{ display: 'none' }} 
              onChange={handleFileUpload}
              disabled={!selectedBank}
            />
            <label 
              htmlFor="ofx-upload" 
              className="btn btn-primary" 
              style={{ cursor: 'pointer' }}
            >
              <Upload size={20} />
              Enviar Arquivo OFX
            </label>
          </div>
        </div>
      </div>

      {matchingResults.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Transações do Extrato</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th>Categoria / Entidade</th>
                  <th>Sugestão</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {matchingResults.map((res, idx) => {
                  const isExpense = res.ofx.amount < 0;
                  return (
                    <tr key={idx}>
                      <td>{new Date(res.ofx.date).toLocaleDateString()}</td>
                      <td>{res.ofx.memo}</td>
                      <td style={{ fontWeight: 700, color: isExpense ? 'var(--danger)' : 'var(--accent)' }}>
                        R$ {res.ofx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ minWidth: '200px' }}>
                        {!res.match && (
                            <select 
                              className="input" 
                              style={{ fontSize: '0.75rem', padding: '0.3rem' }}
                              value={rowBanks[idx] || selectedBank || ''}
                              onChange={e => setRowBanks({ ...rowBanks, [idx]: e.target.value })}
                            >
                              <option value="">Selecionar Banco...</option>
                              {banks.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                              ))}
                            </select>
                            <select 
                              className="input" 
                              style={{ fontSize: '0.75rem', padding: '0.3rem' }}
                              value={selectedCategories[idx] || ''}
                              onChange={e => setSelectedCategories({ ...selectedCategories, [idx]: e.target.value })}
                            >
                              <option value="">Selecionar Categoria...</option>
                              {categories
                                .filter(c => c.type === (isExpense ? 'expense' : 'income'))
                                .map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                                ))
                              }
                            </select>
                            <select 
                              className="input" 
                              style={{ fontSize: '0.75rem', padding: '0.3rem' }}
                              value={selectedEntities[idx] || ''}
                              onChange={e => setSelectedEntities({ ...selectedEntities, [idx]: e.target.value })}
                            >
                              <option value="">Selecionar {isExpense ? 'Fornecedor' : 'Cliente'}...</option>
                              {entities
                                .filter(ent => ent.type === (isExpense ? 'supplier' : 'customer'))
                                .map(ent => (
                                  <option key={ent.id} value={ent.id}>{ent.name}</option>
                                ))
                              }
                            </select>
                          </div>
                        )}
                      </td>
                      <td>
                        {res.match ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
                            <Check size={16} />
                            <span>{res.match.description}</span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)' }}>
                            <AlertTriangle size={16} />
                            <span>Novo Lançamento</span>
                          </div>
                        )}
                      </td>
                      <td>
                        {res.match ? (
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                            onClick={() => handleMatchConciliation(idx)}
                          >
                            Conciliar
                          </button>
                        ) : (
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                            onClick={() => handleCreateAndConciliate(idx)}
                          >
                            Criar e Baixar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Conciliation;
