export default function PatientsList({ patients, onSelect }) {
  return (
    <div className="bg-white border border-gray-200 p-6 rounded-xl">
      <h3 className="text-lg font-semibold mb-4">
        My Patients
      </h3>

      {patients.length === 0 && (
        <p className="text-gray-500">No patients yet.</p>
      )}

      {patients.map((p) => (
        <div
          key={p.id}
          className="flex justify-between items-center mb-3"
        >
          <span>{p.name}</span>
          <button
            onClick={() => onSelect(p.id)}
            className="bg-gray-200 px-3 py-1 rounded-lg"
          >
            View Reports
          </button>
        </div>
      ))}
    </div>
  );
}