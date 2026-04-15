import React, { useState } from 'react';
import { Users } from 'lucide-react';
import UsersList from '../Components/UsersList';
import AddUserButton from '../Components/AddUserButton';
import BackToDashboardButton from '../../Shared/components/BackToDashboardButton';
import StatusFilter from '../../Shared/components/StatusFilter';
import '../Styles/UsersPage.css';

const UsersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  return (
    <div className="users-page">
      {/* Compact Header */}
      <div className="users-page__header">
        <div className="users-page__header-inner">
          <div className="users-page__header-left">
            <div className="users-page__header-icon">
              <Users size={18} strokeWidth={2} />
            </div>
            <h1 className="users-page__title">Gestión de Usuarios</h1>
          </div>
          <BackToDashboardButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="users-page__main">
        {/* Action Bar */}
        <div className="users-page__action-bar">
          <div className="users-page__controls-row">
            <div className="users-page__search-wrapper">
              <div className="users-page__search-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="users-page__search-input"
              />
            </div>

            <StatusFilter
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
            />

            <AddUserButton />
          </div>
        </div>

        {/* Users List */}
        <UsersList searchTerm={searchTerm} statusFilter={statusFilter} />
      </div>
    </div>
  );
};

export default UsersPage;
