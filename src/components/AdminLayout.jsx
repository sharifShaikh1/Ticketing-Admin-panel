import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, NavLink, useParams, useNavigate, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import UserTable from './UserTable';
import DetailsModal from './DetailsModal';
import ConfirmModal from './ConfirmModal';
import TicketCreationForm from './TicketCreationForm';
import TicketTable from './TicketTable';
import TicketDetailsModal from './TicketDetailsModal';
import AssignEngineerModal from './AssignEngineerModal';
import QRCode from 'qrcode.react';

const API_URL = 'http://localhost:8021/api';

const AdminDashboard = ({ token, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [viewingUser, setViewingUser] = useState(null);
  const [viewingTicket, setViewingTicket] = useState(null);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [showAssignEngineer, setShowAssignEngineer] = useState(null);
  const [paymentQR, setPaymentQR] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const navigate = useNavigate();
  const location = useLocation();

  const fetchUsers = useCallback(async (status) => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(`${API_URL}/admin/engineers/${status}`, config);
      setUsers(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not fetch users.');
      if (err.response?.status === 401) {
        onLogout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [token, onLogout, navigate]);

  const fetchTickets = useCallback(async (urlStatus) => {
    setLoading(true);
    try {
      const statusMap = {
        'open': 'Open',
        'in-progress': 'In Progress',
        'closed': 'Closed',
      };
      const apiStatus = statusMap[urlStatus];
      if (!apiStatus) throw new Error('Invalid status');

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(`${API_URL}/tickets/${apiStatus}`, config);
      setTickets(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not fetch tickets.');
      if (err.response?.status === 401) {
        onLogout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [token, onLogout, navigate]);

  const handleApprovalAction = async (userId, action) => {
    setConfirmState({ isOpen: false });
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${API_URL}/admin/engineers/${userId}/${action}`, {}, config);
      alert(`User successfully ${action}ed.`);
      fetchUsers('pending');
      navigate('/admin/engineers/pending');
    } catch (err) {
      alert(`Error: ${err.response?.data?.message || 'Action failed.'}`);
    }
  };

  const promptForApproval = (userId, action) => {
    setConfirmState({
      isOpen: true,
      title: `Confirm ${action}`,
      message: `Are you sure you want to ${action} this application? This action cannot be undone.`,
      onConfirm: () => handleApprovalAction(userId, action),
    });
  };

  const handleCreateTicket = async (ticketData) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${API_URL}/tickets`, ticketData, config);
      alert('Ticket created successfully.');
      setShowCreateTicket(false);
      fetchTickets('open');
      navigate('/admin/tickets/open');
    } catch (err) {
      alert(`Error: ${err.response?.data?.message || 'Ticket creation failed.'}`);
    }
  };

  const handleAssignEngineer = async (ticketId, engineerId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${API_URL}/tickets/${ticketId}/assign`, { engineerId }, config);
      alert('Engineer assigned successfully.');
      setShowAssignEngineer(null);
      fetchTickets('in-progress');
      navigate('/admin/tickets/in-progress');
    } catch (err) {
      alert(`Error: ${err.response?.data?.message || 'Assignment failed.'}`);
    }
  };

  const handleStatusChange = async (ticketId, status) => {
    setConfirmState({
      isOpen: true,
      title: `Confirm ${status} Ticket`,
      message: `Are you sure you want to set this ticket to ${status}?`,
      onConfirm: async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${token}` } };
          await axios.put(`${API_URL}/tickets/${ticketId}/status`, { status }, config);
          alert('Ticket status updated.');
          setConfirmState({ isOpen: false });
          fetchTickets(status.toLowerCase());
          navigate(`/admin/tickets/${status.toLowerCase()}`);
        } catch (err) {
          alert(`Error: ${err.response?.data?.message || 'Status update failed.'}`);
          setConfirmState({ isOpen: false });
        }
      },
    });
  };

  const handleInitiatePayment = async (ticketId) => {
    setConfirmState({
      isOpen: true,
      title: 'Initiate Payment',
      message: 'Are you sure you want to initiate payment for this ticket?',
      onConfirm: async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const { data } = await axios.post(`${API_URL}/tickets/${ticketId}/initiate-payment`, {}, config);
          setPaymentQR(data.upiUrl);
          setPaymentIntentId(data.paymentIntentId);
          alert('Payment initiated. Use a UPI app to complete the payment.');
          setConfirmState({ isOpen: false });
        } catch (err) {
          alert(`Error: ${err.response?.data?.message || 'Payment initiation failed.'}`);
          setConfirmState({ isOpen: false });
        }
      },
    });
  };

  useEffect(() => {
    if (paymentIntentId) {
      const pollPaymentStatus = async () => {
        try {
          const ticket = await axios.get(`${API_URL}/tickets`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const updatedTicket = ticket.data.find(t => t.paymentDetails?.paymentIntentId === paymentIntentId);
          if (updatedTicket?.paymentStatus === 'Paid') {
            alert('Payment succeeded!');
            setPaymentQR(null);
            setPaymentIntentId(null);
            fetchTickets('closed');
          } else if (updatedTicket?.paymentStatus === 'Failed') {
            alert('Payment failed.');
            setPaymentQR(null);
            setPaymentIntentId(null);
            fetchTickets('closed');
          }
        } catch (err) {
          console.error('Payment status poll error:', err);
        }
      };
      const interval = setInterval(pollPaymentStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [paymentIntentId, token, fetchTickets]);

  const isUserManagementActive = location.pathname.startsWith('/admin/engineers');
  const isTicketsActive = location.pathname.startsWith('/admin/tickets');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <nav className="w-72 bg-gray-900 text-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-teal-400">FieldSync Admin</h1>
          <hr className="my-4 border-gray-700" />
          <ul className="space-y-2">
            <li>
              <NavLink
                to="/admin/engineers/pending"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-all ${
                    isActive || isUserManagementActive ? 'bg-teal-500 text-white' : 'hover:bg-gray-800 hover:text-teal-300'
                  }`
                }
              >
                <span className="mr-3">👤</span>
                User Management
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/tickets/open"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-all ${
                    isActive || isTicketsActive ? 'bg-teal-500 text-white' : 'hover:bg-gray-800 hover:text-teal-300'
                  }`
                }
              >
                <span className="mr-3">🎫</span>
                Tickets
              </NavLink>
            </li>
          </ul>
        </div>
        <div className="absolute bottom-6 left-6 w-60">
          <button
            onClick={() => {
              onLogout();
              navigate('/login');
            }}
            className="w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="flex-1 p-8">
        <Routes>
          <Route
            path="engineers/:status"
            element={
              <UserManagement
                fetchUsers={fetchUsers}
                users={users}
                loading={loading}
                error={error}
                onAction={promptForApproval}
                onViewDetails={setViewingUser}
              />
            }
          />
          <Route
            path="tickets/:status"
            element={
              <TicketManagement
                fetchTickets={fetchTickets}
                tickets={tickets}
                loading={loading}
                error={error}
                onAssign={(ticketId) => setShowAssignEngineer(ticketId)}
                onStatusChange={handleStatusChange}
                onViewDetails={setViewingTicket}
                onCreateTicket={() => setShowCreateTicket(true)}
                onInitiatePayment={handleInitiatePayment}
              />
            }
          />
          <Route path="*" element={<Navigate to="/admin/engineers/pending" replace />} />
        </Routes>
        {paymentQR && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <h3 className="text-lg font-semibold mb-4">Scan to Pay</h3>
              <QRCode value={paymentQR} size={256} />
              <a
                href={paymentQR}
                className="mt-4 block text-center text-blue-600 hover:underline"
              >
                Or pay via UPI app
              </a>
              <button
                onClick={() => setPaymentQR(null)}
                className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>

      <DetailsModal user={viewingUser} onClose={() => setViewingUser(null)} />
      <TicketDetailsModal ticket={viewingTicket} onClose={() => setViewingTicket(null)} />
      {showCreateTicket && (
        <TicketCreationForm
          onSubmit={handleCreateTicket}
          onCancel={() => setShowCreateTicket(false)}
        />
      )}
      {showAssignEngineer && (
        <AssignEngineerModal
          ticketId={showAssignEngineer}
          onAssign={handleAssignEngineer}
          onCancel={() => setShowAssignEngineer(null)}
          token={token}
        />
      )}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState({ isOpen: false })}
      />
    </div>
  );
};

const UserManagement = ({ fetchUsers, users, loading, error, onAction, onViewDetails }) => {
  const { status } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === 'pending' || status === 'approved') {
      fetchUsers(status);
    } else {
      navigate('/admin/engineers/pending');
    }
  }, [status, fetchUsers, navigate]);

  return (
    <div>
      <h2 className="text-3xl font-semibold text-gray-900 mb-6">User Management</h2>
      <div className="bg-white rounded-xl shadow-md">
        <div className="border-b border-gray-200 px-6 py-4">
          <nav className="flex space-x-8">
            <NavLink
              to="/admin/engineers/pending"
              className={({ isActive }) =>
                `text-sm font-medium py-4 px-2 border-b-2 transition ${
                  isActive ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
              }
            >
              Pending Applications
            </NavLink>
            <NavLink
              to="/admin/engineers/approved"
              className={({ isActive }) =>
                `text-sm font-medium py-4 px-2 border-b-2 transition ${
                  isActive ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
              }
            >
              Active Engineers
            </NavLink>
          </nav>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          ) : error ? (
            <p className="text-red-600 text-center py-10">{error}</p>
          ) : (
            <UserTable users={users} view={status} onAction={onAction} onViewDetails={onViewDetails} />
          )}
        </div>
      </div>
    </div>
  );
};

const TicketManagement = ({ fetchTickets, tickets, loading, error, onAssign, onStatusChange, onViewDetails, onCreateTicket, onInitiatePayment }) => {
  const { status } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (['open', 'in-progress', 'closed'].includes(status)) {
      fetchTickets(status);
    } else {
      navigate('/admin/tickets/open');
    }
  }, [status, fetchTickets, navigate]);

  return (
    <div>
      <h2 className="text-3xl font-semibold text-gray-900 mb-6">Ticket Management</h2>
      <div className="bg-white rounded-xl shadow-md">
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <nav className="flex space-x-8">
            <NavLink
              to="/admin/tickets/open"
              className={({ isActive }) =>
                `text-sm font-medium py-4 px-2 border-b-2 transition ${
                  isActive ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
              }
            >
              Open
            </NavLink>
            <NavLink
              to="/admin/tickets/in-progress"
              className={({ isActive }) =>
                `text-sm font-medium py-4 px-2 border-b-2 transition ${
                  isActive ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
              }
            >
              In Progress
            </NavLink>
            <NavLink
              to="/admin/tickets/closed"
              className={({ isActive }) =>
                `text-sm font-medium py-4 px-2 border-b-2 transition ${
                  isActive ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
              }
            >
              Closed
            </NavLink>
          </nav>
          <button
            onClick={onCreateTicket}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Create Ticket
          </button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          ) : error ? (
            <p className="text-red-600 text-center py-10">{error}</p>
          ) : (
            <TicketTable
              tickets={tickets}
              onAssign={onAssign}
              onStatusChange={onStatusChange}
              onViewDetails={onViewDetails}
              onInitiatePayment={onInitiatePayment}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;