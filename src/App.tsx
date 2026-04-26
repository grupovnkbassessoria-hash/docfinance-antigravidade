import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import Transactions from './pages/Transactions';
import Entities from './pages/Entities';
import Banks from './pages/Banks';
import Categories from './pages/Categories';
import FinancialMovement from './pages/FinancialMovement';
import InstallmentsReport from './pages/InstallmentsReport';
import Conciliation from './pages/Conciliation';
import DRE from './pages/DRE';
import BalanceSheet from './pages/BalanceSheet';
import Login from './pages/Login';
import Backup from './pages/Backup';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  const { isAuthenticated, login, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/faturamento" element={<Invoices />} />
            <Route path="/contas-receber" element={<Transactions type="receivable" />} />
            <Route path="/contas-pagar" element={<Transactions type="payable" />} />
            <Route path="/conciliacao" element={<Conciliation />} />
            <Route path="/bancos" element={<Banks />} />
            <Route path="/categorias" element={<Categories />} />
            <Route path="/clientes" element={<Entities type="customer" />} />
            <Route path="/fornecedores" element={<Entities type="supplier" />} />
            <Route path="/movimentacao" element={<FinancialMovement />} />
            <Route path="/parcelamentos" element={<InstallmentsReport />} />
            <Route path="/dre" element={<DRE />} />
            <Route path="/balanco" element={<BalanceSheet />} />
            <Route path="/backup" element={<Backup />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
