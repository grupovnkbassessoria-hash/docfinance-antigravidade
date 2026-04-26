import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface Bank {
  id: string;
  name: string;
  account_number: string;
  initial_balance: number;
  current_balance: number;
  color: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  parent_id?: string;
}

export interface Entity {
  id: string;
  name: string;
  type: 'customer' | 'supplier';
  document?: string;
  email?: string;
  phone?: string;
}

export interface Transaction {
  id: string;
  description: string;
  type: 'payable' | 'receivable';
  amount: number;
  due_date: string;
  payment_date?: string;
  status: 'pending' | 'paid' | 'cancelled';
  category_id?: string;
  bank_id?: string;
  entity_id?: string | null;
  installment_number: number;
  total_installments: number;
  parent_id?: string | null;
  ofx_transaction_id?: string | null;
  responsible?: 'Clara' | 'Victor' | null;
  created_at: string;
  categories?: Category;
  banks?: Bank;
  entities?: Entity;
}

export interface Invoice {
  id: string;
  invoice_number: number;
  entity_id: string;
  category_id?: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  status: 'draft' | 'billed' | 'cancelled';
  observations: string;
  transaction_id?: string;
  entities?: Entity;
  fin_invoice_items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export const useFinance = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [banksRes, categoriesRes, entitiesRes, transactionsRes, invoicesRes] = await Promise.all([
        supabase.from('banks').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('entities').select('*'),
        supabase.from('transactions').select('*, categories(*), banks(*), entities(*)').order('due_date', { ascending: true }),
        supabase.from('fin_invoices').select('*, entities(*), fin_invoice_items(*)').order('created_at', { ascending: false })
      ]);

      if (banksRes.error) console.error('Error fetching banks:', banksRes.error);
      if (categoriesRes.error) console.error('Error fetching categories:', categoriesRes.error);
      if (entitiesRes.error) console.error('Error fetching entities:', entitiesRes.error);
      if (transactionsRes.error) console.error('Error fetching transactions:', transactionsRes.error);
      if (invoicesRes.error) console.error('Error fetching invoices:', invoicesRes.error);

      if (banksRes.data) setBanks(banksRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (entitiesRes.data) setEntities(entitiesRes.data);
      if (transactionsRes.data) setTransactions(transactionsRes.data as Transaction[]);
      if (invoicesRes.data) setInvoices(invoicesRes.data as Invoice[]);
    } catch (error) {
      console.error('Critical error fetching finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addTransaction = async (transaction: Partial<Transaction>, installments = 1, isRecurring = false) => {
    if (installments > 1) {
      const parentId = uuidv4();
      const amountPerTransaction = isRecurring ? (transaction.amount || 0) : (transaction.amount || 0) / installments;
      const dueDate = new Date(transaction.due_date || new Date());
      
      const transactionsToAdd = Array.from({ length: installments }).map((_, i) => ({
        ...transaction,
        id: i === 0 ? parentId : uuidv4(),
        amount: amountPerTransaction,
        due_date: new Date(dueDate.getFullYear(), dueDate.getMonth() + i, dueDate.getDate()).toISOString().split('T')[0],
        installment_number: i + 1,
        total_installments: installments,
        parent_id: i === 0 ? null : parentId,
      }));

      const { data, error } = await supabase.from('transactions').insert(transactionsToAdd).select();
      if (!error) {
        // If any were paid (unlikely for installments but possible), update balance
        const paidTransactions = transactionsToAdd.filter(t => t.status === 'paid' && t.bank_id);
        for (const t of paidTransactions) {
          const bank = banks.find(b => b.id === t.bank_id);
          if (bank) {
            let newBalance = Number(bank.current_balance);
            if (t.type === 'payable') newBalance -= Number(t.amount);
            else newBalance += Number(t.amount);
            await supabase.from('banks').update({ current_balance: newBalance }).eq('id', bank.id);
          }
        }
        fetchData();
      }
      return { data, error };
    } else {
      if (transaction.status === 'paid' && transaction.bank_id) {
        const bank = banks.find(b => b.id === transaction.bank_id);
        if (bank) {
          let newBalance = Number(bank.current_balance);
          if (transaction.type === 'payable') newBalance -= Number(transaction.amount);
          else newBalance += Number(transaction.amount);
          await supabase.from('banks').update({ current_balance: newBalance }).eq('id', bank.id);
        }
      }
      const { data, error } = await supabase.from('transactions').insert([transaction]).select();
      if (!error) fetchData();
      return { data, error };
    }
  };

  const updateTransactionStatus = async (id: string, status: 'paid' | 'pending', payment_date?: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return { error: 'Transaction not found' };

    // If status is changing, update bank balance
    if (transaction.status !== status && transaction.bank_id) {
      const bank = banks.find(b => b.id === transaction.bank_id);
      if (bank) {
        let newBalance = Number(bank.current_balance);
        const amount = Number(transaction.amount);

        if (status === 'paid') {
          // Marking as paid
          if (transaction.type === 'payable') newBalance -= amount;
          else newBalance += amount;
        } else {
          // Marking as pending (reverting payment)
          if (transaction.type === 'payable') newBalance += amount;
          else newBalance -= amount;
        }

        await supabase.from('banks').update({ current_balance: newBalance }).eq('id', bank.id);
      }
    }

    const { error } = await supabase
      .from('transactions')
      .update({ 
        status, 
        payment_date: status === 'paid' ? (payment_date || new Date().toISOString().split('T')[0]) : null 
      })
      .eq('id', id);
    
    if (!error) fetchData();
    return { error };
  };

  const deleteTransaction = async (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return { error: 'Transaction not found' };

    // If transaction was paid, revert bank balance
    if (transaction.status === 'paid' && transaction.bank_id) {
      const bank = banks.find(b => b.id === transaction.bank_id);
      if (bank) {
        let newBalance = Number(bank.current_balance);
        const amount = Number(transaction.amount);

        if (transaction.type === 'payable') newBalance += amount;
        else newBalance -= amount;

        await supabase.from('banks').update({ current_balance: newBalance }).eq('id', bank.id);
      }
    }

    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) fetchData();
    return { error };
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const { error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id);
    
    if (!error) fetchData();
    return { error };
  };

  const createInvoice = async (invoice: Partial<Invoice>, items: Partial<InvoiceItem>[]) => {
    const { data: invData, error: invError } = await supabase
      .from('fin_invoices')
      .insert([invoice])
      .select()
      .single();

    if (invError || !invData) return { error: invError };

    const itemsToAdd = items.map(item => ({ ...item, invoice_id: invData.id }));
    const { error: itemsError } = await supabase.from('fin_invoice_items').insert(itemsToAdd);

    if (itemsError) return { error: itemsError };

    fetchData();
    return { data: invData };
  };

  const billInvoice = async (invoiceId: string) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return { error: 'Invoice not found' };

    const { data: transData, error: transError } = await supabase
      .from('transactions')
      .insert([{
        description: `Faturamento - NF #${invoice.invoice_number}`,
        amount: invoice.total_amount,
        due_date: invoice.due_date,
        type: 'receivable',
        status: 'pending',
        entity_id: invoice.entity_id,
        bank_id: banks[0]?.id,
        category_id: invoice.category_id || categories.find(c => c.name.includes('Vendas'))?.id
      }])
      .select()
      .single();

    if (transError) return { error: transError };

    const { error: updError } = await supabase
      .from('fin_invoices')
      .update({ status: 'billed', transaction_id: transData.id })
      .eq('id', invoiceId);

    if (updError) return { error: updError };

    fetchData();
    return { success: true };
  };

  return {
    banks,
    categories,
    entities,
    transactions,
    invoices,
    loading,
    refresh: fetchData,
    addTransaction,
    updateTransactionStatus,
    updateTransaction,
    deleteTransaction,
    createInvoice,
    billInvoice
  };
};
