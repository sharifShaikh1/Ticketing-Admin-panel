import React from 'react';

const TicketDetailsModal = ({ ticket, onClose }) => {
  if (!ticket) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
        <h3 className="text-lg font-semibold mb-4">Ticket Details</h3>
        <p><strong>Ticket ID:</strong> {ticket.ticketId}</p>
        <p><strong>Field Site ID:</strong> {ticket.fieldSiteId}</p>
        <p><strong>Company:</strong> {ticket.companyName}</p>
        <p><strong>Address:</strong> {ticket.siteAddress}</p>
        <p><strong>Coordinates:</strong> {ticket.coordinates?.latitude}, {ticket.coordinates?.longitude}</p>
        <p><strong>Work Description:</strong> {ticket.workDescription}</p>
        <p><strong>Amount:</strong> ₹{ticket.amount}</p>
        <p><strong>Expertise Required:</strong> {ticket.expertiseRequired.join(', ')}</p>
        <p><strong>Assigned Engineer:</strong> {ticket.assignedEngineer?.name || 'N/A'}</p>
        <p><strong>Employee ID:</strong> {ticket.assignedEngineer?.employeeId || 'N/A'}</p>
        <p><strong>Status:</strong> {ticket.status}</p>
        <p><strong>Payment Status:</strong> {ticket.paymentStatus}</p>
        <p><strong>Created At:</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
        {ticket.closedAt && <p><strong>Closed At:</strong> {new Date(ticket.closedAt).toLocaleString()}</p>}
        {ticket.paymentDetails?.paymentIntentId && (
          <p><strong>Payment Intent ID:</strong> {ticket.paymentDetails.paymentIntentId}</p>
        )}
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

export default TicketDetailsModal;