// src/pages/UserManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import UserTable from '../components/UserTable';
import DetailsModal from '../components/DetailsModal';
import ConfirmModal from '../components/ConfirmModal';

const API_URL = 'http://localhost:8021/api';

const UserManagementPage = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [viewingUser, setViewingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmState, setConfirmState] = useState({ isOpen: false });
  const { status } = useParams();
  const navigate = useNavigate();

  const fetchUsers = useCallback(async (currentStatus) => {
    if (!currentStatus) return;
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(`${API_URL}/admin/engineers/${currentStatus}`, config);
      setUsers(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not fetch data.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const validStatuses = ['pending', 'approved'];
    const currentStatus = status || 'pending';
    if (validStatuses.includes(currentStatus)) {
        fetchUsers(currentStatus);
    } else {
        navigate('/users/pending', { replace: true });
    }
  }, [status, fetchUsers, navigate]);

  const handleAction = async (userId, action) => {
    setConfirmState({ isOpen: false });
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${API_URL}/admin/engineers/${userId}/${action}`, {}, config);
      alert(`User successfully ${action}ed.`);
      fetchUsers(status); // Refetch the current list
    } catch (err) {
      alert(`Error: ${err.response?.data?.message || 'Action failed.'}`);
    }
  };

  const promptForAction = (userId, action) => {
    setConfirmState({
      isOpen: true,
      title: `Confirm ${action}`,
      message: `Are you sure you want to ${action} this application?`,
      onConfirm: () => handleAction(userId, action),
    });
  };
  
  const activeTabStyle = 'border-blue-500 text-blue-600';
  const inactiveTabStyle = 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">User Management</h2>
      <p className="text-gray-500 mb-6">Approve new applications or view active engineers.</p>
      
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <NavLink
              to="/users/pending"
              className={({isActive}) => `whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm ${isActive ? activeTabStyle : inactiveTabStyle}`}
            >
              Pending Applications
            </NavLink>
            <NavLink
              to="/users/approved"
              className={({isActive}) => `whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm ${isActive ? activeTabStyle : inactiveTabStyle}`}
            >
              Active Engineers
            </NavLink>
          </nav>
        </div>
        <div className="mt-6">
          {loading ? <p>Loading...</p> : error ? <p className="text-red-500">{error}</p> : <UserTable users={users} view={status} onAction={promptForAction} onViewDetails={setViewingUser} />}
        </div>
      </div>
      <DetailsModal user={viewingUser} onClose={() => setViewingUser(null)} />
      <ConfirmModal isOpen={confirmState.isOpen} title={confirmState.title} message={confirmState.message} onConfirm={confirmState.onConfirm} onCancel={() => setConfirmState({ isOpen: false })} />
    </div>
  );
};

export default UserManagementPage;
