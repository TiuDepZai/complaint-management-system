// components/TimelineBar.jsx
import React from "react";

/**
 * TimelineBar
 * props:
 *  - complaint: object with createdAt, assignedDate, inProgressDate, resolvedDate, status
 *
 * Steps: Created -> Assigned -> In Progress -> Resolved
 */
export default function TimelineBar({ complaint }) {
  // Utility to format date or return placeholder
  const fmt = (d) => (d ? new Date(d).toLocaleString() : null);

  // Steps definition (order matters)
  const steps = [
    { key: "created", label: "Created", date: complaint.createdAt },
    { key: "assigned", label: "Assigned", date: complaint.assignedDate },
    { key: "inProgress", label: "In Progress", date: complaint.inProgressDate },
    { key: "resolved", label: "Resolved", date: complaint.resolvedDate },
  ];

  // Determine active index (highest step that has a date OR based on status)
  let activeIndex = 0;
  for (let i = steps.length - 1; i >= 0; i--) {
    if (steps[i].date) {
      activeIndex = i;
      break;
    }
  }

  // If no date set but status matches a later step, push activeIndex forward
  const statusToIndex = {
    Pending: 0,
    Assigned: 1,
    "In Progress": 2,
    Resolved: 3,
  };
  if (complaint.status && statusToIndex[complaint.status] > activeIndex) {
    activeIndex = statusToIndex[complaint.status];
  }

  // percentage for the filled line
  const percentFilled = (activeIndex / (steps.length - 1)) * 100;

  return (
    <div className="timeline w-full px-2 py-3">
      {/* Steps row (icons + labels) */}
      <div className="relative">
        {/* horizontal line background */}
        <div className="absolute left-4 right-4 top-6 h-1 bg-gray-200 rounded-full" aria-hidden />

        {/* filled progress */}
        <div
          className="absolute left-4 top-6 h-1 bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${percentFilled}%`, minWidth: "0" }}
          aria-hidden
        />

        <div className="flex justify-between items-start relative z-10">
          {steps.map((s, idx) => {
            const isActive = idx <= activeIndex;
            return (
              <div key={s.key} className="flex-1 min-w-0">
                <div className="flex flex-col items-center text-center px-2">
                  {/* Circle icon */}
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isActive ? "bg-blue-500 border-blue-500 text-white" : "bg-white border-gray-300 text-gray-600"
                    } transition-colors`}
                    aria-hidden
                  >
                    {/* simple check or step number */}
                    {isActive ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414-1.414L8 11.172 4.707 7.879a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="font-medium">{idx + 1}</span>
                    )}
                  </div>

                  {/* Label */}
                  <div className={`mt-2 text-xs font-medium ${isActive ? "text-gray-800" : "text-gray-500"}`}>
                    {s.label}
                  </div>

                  {/* Date (if present) */}
                  <div className="mt-1 text-[11px] text-gray-500">
                    {s.date ? fmt(s.date) : <span className="italic text-gray-400">—</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
