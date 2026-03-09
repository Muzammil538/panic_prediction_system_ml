import React from "react";

export default function PredictionResultModal({ result, onClose }) {
  if (!result) return null;

  const timestamp = result.timestamp ? new Date(result.timestamp) : null;
  const displayDate = timestamp
    ? timestamp.toLocaleDateString()
    : result.date;
  const displayTime = timestamp
    ? timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : result.time;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[500px] rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-blue-600 mb-4">
          Panic Attack Risk Report
        </h2>

        {/* Risk Score */}

        <div className="mb-4">
          <p className="text-gray-600">Risk Score</p>

          <p className="text-3xl font-bold text-red-500">
            {result.risk_score}%
          </p>
        </div>

        {/* Severity */}

        <div className="mb-4">
          <p className="text-gray-600">Severity Level</p>

          <p className="font-semibold text-lg">{result.severity}</p>
        </div>

        {/* Trend */}

        <div className="mb-4">
          <p className="text-gray-600">Risk Trend</p>

          <p className="font-semibold">
            {result.trend === "Risk Increased" && (
              <span className="text-red-500">↑ Risk Increased</span>
            )}

            {result.trend === "Risk Decreased" && (
              <span className="text-green-500">↓ Risk Decreased</span>
            )}

            {result.trend === "Risk Stable" && (
              <span className="text-gray-600">Risk Stable</span>
            )}

            {result.trend === "First Assessment" && (
              <span className="text-blue-600">First Assessment</span>
            )}
          </p>
        </div>

        {/* Previous Risk */}

        {result.previous_risk && (
          <div className="mb-4">
            <p className="text-gray-600">Previous Risk</p>

            <p className="font-semibold">{result.previous_risk}%</p>
          </div>
        )}

        {/* Influential Factors */}

        <div className="mb-4">
          <p className="text-gray-600 mb-2">Most Influential Factors</p>

          <ul className="list-disc pl-5 text-gray-700">
            {result.top_factors.map((factor, index) => (
              <li key={index}>{factor}</li>
            ))}
          </ul>
        </div>

        {/* Metadata */}

        <div className="border-t pt-3 mt-3 text-sm text-gray-600">
          <p>Assessment ID: {result.assessment_id}</p>

          <p>Date: {displayDate}</p>

          <p>Time: {displayTime}</p>
        </div>

        {/* Close Button */}

        <button
          onClick={onClose}
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
