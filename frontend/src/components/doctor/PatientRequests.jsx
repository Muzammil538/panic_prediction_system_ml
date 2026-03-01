export default function PatientRequests({ requests, onAccept }) {
  return (
    <div className="bg-white border border-gray-200 p-6 rounded-xl">
      <h3 className="text-lg font-semibold mb-4">
        Pending Requests
      </h3>

      {requests.length === 0 && (
        <p className="text-gray-500">No pending requests.</p>
      )}

      {requests.map((req) => (
        <div
          key={req.request_id}
          className="flex justify-between items-center mb-3"
        >
          <span>{req.patient_name}</span>
          <button
            onClick={() => onAccept(req.request_id)}
            className="bg-blue-600 text-white px-3 py-1 rounded-lg"
          >
            Accept
          </button>
        </div>
      ))}
    </div>
  );
}