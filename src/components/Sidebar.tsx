import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Building2, 
  Users, 
  UserRound, 
  FileText, 
  PieChart, 
  Receipt,
  Library,
  Tag,
  Layers
} from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar glass">
      <div className="brand">
        <Receipt size={32} />
        <span>CLARA - FINANÇAS</span>
      </div>
      
      <nav>
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink to="/faturamento" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Receipt size={20} />
          <span>Faturamento</span>
        </NavLink>
        
        <NavLink to="/contas-receber" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <ArrowUpCircle size={20} />
          <span>Contas a Receber</span>
        </NavLink>
        
        <NavLink to="/contas-pagar" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <ArrowDownCircle size={20} />
          <span>Contas a Pagar</span>
        </NavLink>
        
        <NavLink to="/conciliacao" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Library size={20} />
          <span>Conciliação OFX</span>
        </NavLink>
        
        <div style={{ margin: '1.5rem 0 0.5rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase' }}>Cadastros</div>
        
        <NavLink to="/bancos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Building2 size={20} />
          <span>Bancos / Contas</span>
        </NavLink>

        <NavLink to="/categorias" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Tag size={20} />
          <span>Categorias</span>
        </NavLink>
        
        <NavLink to="/clientes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          <span>Clientes</span>
        </NavLink>
        
        <NavLink to="/fornecedores" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <UserRound size={20} />
          <span>Fornecedores</span>
        </NavLink>
        
        <div style={{ margin: '1.5rem 0 0.5rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase' }}>Relatórios</div>
        
        <NavLink to="/movimentacao" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FileText size={20} />
          <span>Movimentação</span>
        </NavLink>

        <NavLink to="/parcelamentos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Layers size={20} />
          <span>Parcelamentos</span>
        </NavLink>
        
        <NavLink to="/dre" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FileText size={20} />
          <span>DRE</span>
        </NavLink>
        
        <NavLink to="/balanco" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <PieChart size={20} />
          <span>Balanço Patrimonial</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
