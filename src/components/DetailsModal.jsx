import React from 'react';

const DetailsModal = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
        <h3 className="text-lg font-semibold mb-4">User Details</h3>
        <p><strong>Name:</strong> {user.fullName}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.phoneNumber}</p>
        <p><strong>Employee ID:</strong> {user.employeeId}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Status:</strong> {user.status}</p>
        <p><strong>Expertise:</strong> {user.expertise?.join(', ') || 'N/A'}</p>
        <p><strong>UPI ID:</strong> {user.upiId || 'N/A'}</p>
        <p><strong>Service Areas:</strong> {user.serviceAreas?.map(area => area.name).join(', ') || 'N/A'}</p>
        <div className="mt-4">
          <h4 className="font-semibold">Documents</h4>
          <p><strong>Aadhaar:</strong> {user.documents?.aadhaar?.number || 'N/A'}</p>
          <p><strong>License:</strong> {user.documents?.license?.number || 'N/A'}</p>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default DetailsModal;