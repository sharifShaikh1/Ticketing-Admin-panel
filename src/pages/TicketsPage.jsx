// src/pages/TicketsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import CreateTicketModal from '../components/CreateTicketModal';
import TicketTable from '../components/TicketTable';

const API_URL = 'http://localhost:8021/api';

const TicketsPage = ({ token }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { status } = useParams();
  const navigate = useNavigate();

  const fetchTickets = useCallback(async () => {
    const currentStatus = status || 'open';
    const statusMap = { 'open': 'Open', 'in-progress': 'In Progress', 'closed': 'Closed' };
    const apiStatus = statusMap[currentStatus];

    if (!apiStatus) {
        navigate('/tickets/open', { replace: true });
        return;
    }

    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(`${API_URL}/tickets?status=${apiStatus}`, config); // Assuming backend supports filtering by status query
      setTickets(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tickets.');
    } finally {
      setLoading(false);
    }
  }, [token, status, navigate]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const activeTabStyle = 'border-blue-500 text-blue-600';
  const inactiveTabStyle = 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-3xl font-bold text-gray-900">Ticket Management</h2>
            <p className="text-gray-500 mt-1">Create, assign, and track all service tickets.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
        >
          + Create Ticket
        </button>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <NavLink to="/tickets/open" className={({isActive}) => `whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm ${isActive ? activeTabStyle : inactiveTabStyle}`}>Open</NavLink>
            <NavLink to="/tickets/in-progress" className={({isActive}) => `whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm ${isActive ? activeTabStyle : inactiveTabStyle}`}>In Progress</NavLink>
            <NavLink to="/tickets/closed" className={({isActive}) => `whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm ${isActive ? activeTabStyle : inactiveTabStyle}`}>Closed</NavLink>
          </nav>
        </div>
        <div className="mt-6">
            {loading ? <p>Loading tickets...</p> : error ? <p className="text-red-500">{error}</p> : <TicketTable tickets={tickets} />}
        </div>
      </div>
      <CreateTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTicketCreated={fetchTickets}
        token={token}
      />
    </div>
  );
};

export default TicketsPage;
