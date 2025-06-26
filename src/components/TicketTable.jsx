import React from 'react';

const TicketTable = ({ tickets, onAssign, onStatusChange, onViewDetails, onInitiatePayment }) => {
  const handleStatusChange = (ticketId, status) => {
    onStatusChange(ticketId, status);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {tickets.map((ticket) => (
            <tr key={ticket.ticketId}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.ticketId}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.companyName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.siteAddress}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{ticket.amount}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.status}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.paymentStatus}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {ticket.status === 'Open' && !ticket.assignedEngineer?.engineerId && (
                  <button
                    onClick={() => onAssign(ticket.ticketId)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Assign
                  </button>
                )}
                {ticket.status !== 'Closed' && (
                  <button
                    onClick={() => handleStatusChange(ticket.ticketId, 'Closed')}
                    className="text-red-600 hover:text-red-900 mr-4"
                  >
                    Close
                  </button>
                )}
                {ticket.status === 'Closed' && ticket.assignedEngineer?.engineerId && ticket.paymentStatus === 'Pending' && (
                  <button
                    onClick={() => onInitiatePayment(ticket.ticketId)}
                    className="text-green-600 hover:text-green-900 mr-4"
                  >
                    Pay
                  </button>
                )}
                <button
                  onClick={() => onViewDetails(ticket)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketTable;