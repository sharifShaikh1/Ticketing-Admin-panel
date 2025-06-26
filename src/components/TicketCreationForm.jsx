import React, { useState } from 'react';

const TicketCreationForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    siteAddress: '',
    coordinates: { latitude: '', longitude: '' },
    workDescription: '',
    amount: '',
    expertiseRequired: [],
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'latitude' || name === 'longitude') {
      setFormData({
        ...formData,
        coordinates: { ...formData.coordinates, [name]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleExpertiseChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const expertise = checked
        ? [...prev.expertiseRequired, value]
        : prev.expertiseRequired.filter((exp) => exp !== value);
      return { ...prev, expertiseRequired: expertise };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.companyName) return setError('Company Name is required');
    if (!formData.siteAddress) return setError('Site Address is required');
    if (!formData.workDescription) return setError('Work Description is required');
    if (!formData.amount || formData.amount <= 0) return setError('Valid Amount is required');
    if (formData.expertiseRequired.length === 0) return setError('At least one expertise is required');

    setError('');
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
        <h3 className="text-lg font-semibold mb-4">Create New Ticket</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="companyName" className="text-sm font-medium text-gray-700">Company Name</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 text-base text-gray-700 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="siteAddress" className="text-sm font-medium text-gray-700">Site Address</label>
            <input
              type="text"
              id="siteAddress"
              name="siteAddress"
              value={formData.siteAddress}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 text-base text-gray-700 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="latitude" className="text-sm font-medium text-gray-700">Latitude</label>
              <input
                type="number"
                id="latitude"
                name="latitude"
                value={formData.coordinates.latitude}
                onChange={handleChange}
                className="w-full px-4 py-2 mt-1 text-base text-gray-700 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="longitude" className="text-sm font-medium text-gray-700">Longitude</label>
              <input
                type="number"
                id="longitude"
                name="longitude"
                value={formData.coordinates.longitude}
                onChange={handleChange}
                className="w-full px-4 py-2 mt-1 text-base text-gray-700 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="workDescription" className="text-sm font-medium text-gray-700">Work Description</label>
            <textarea
              id="workDescription"
              name="workDescription"
              value={formData.workDescription}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 text-base text-gray-700 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="amount" className="text-sm font-medium text-gray-700">Amount (₹)</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 text-base text-gray-700 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Expertise Required</label>
            <div className="mt-2 space-y-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  value="Networking"
                  checked={formData.expertiseRequired.includes('Networking')}
                  onChange={handleExpertiseChange}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-gray-700">Networking</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  value="CCTV"
                  checked={formData.expertiseRequired.includes('CCTV')}
                  onChange={handleExpertiseChange}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-gray-700">CCTV</span>
              </label>
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketCreationForm;