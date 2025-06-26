import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AssignEngineerModal = ({ ticketId, onAssign, onCancel, token }) => {
  const [engineers, setEngineers] = useState([]);
  const [selectedEngineer, setSelectedEngineer] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEngineers = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get('http://localhost:8021/api/admin/engineers/approved', config);
        setEngineers(data);
        setLoading(false);
      } catch (err) {
        setError('Could not fetch engineers.');
        setLoading(false);
      }
    };
    fetchEngineers();
  }, [token]);

  const handleSubmit = () => {
    if (!selectedEngineer) {
      setError('Please select an engineer.');
      return;
    }
    onAssign(ticketId, selectedEngineer);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
        <h3 className="text-lg font-semibold mb-4">Assign Engineer</h3>
        {loading ? (
          <p>Loading engineers...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="engineer" className="text-sm font-medium text-gray-700">Select Engineer</label>
              <select
                id="engineer"
                value={selectedEngineer}
                onChange={(e) => setSelectedEngineer(e.target.value)}
                className="w-full px-4 py-2 mt-1 text-base text-gray-700 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select an engineer</option>
                {engineers.map((engineer) => (
                  <option key={engineer._id} value={engineer._id}>
                    {engineer.fullName} ({engineer.employeeId})
                  </option>
                ))}
              </select>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex space-x-4">
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Assign
              </button>
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignEngineerModal;