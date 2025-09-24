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
  const fmt = (d) => (d ? new Date(d).toLocaleString() : null);

  const steps = [
    { key: "created",    label: "Created",     date: complaint.createdAt },
    { key: "assigned",   label: "Assigned",    date: complaint.assignedDate },
    { key: "inProgress", label: "In Progress", date: complaint.inProgressDate },
    { key: "resolved",   label: "Resolved",    date: complaint.resolvedDate },
  ];

  // Find the furthest completed step, based on dates then status
  let activeIndex = 0;
  for (let i = steps.length - 1; i >= 0; i--) {
    if (steps[i].date) { activeIndex = i; break; }
  }
  const statusToIndex = { Pending: 0, Assigned: 1, "In Progress": 2, Resolved: 3 };
  if (complaint.status && statusToIndex[complaint.status] > activeIndex) {
    activeIndex = statusToIndex[complaint.status];
  }

  return (
    <div className="w-full px-2 py-3">
      {/* Row 1: circles with connecting segments. Using flex makes segments end at circle edges. */}
      <div className="flex items-center px-6">
        {steps.map((s, idx) => {
          const isActive = idx <= activeIndex;
          const circle =
            <div
              key={`${s.key}-circle`}
              className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                ${isActive ? "bg-blue-500 border-blue-500 text-white" : "bg-white border-gray-300 text-gray-600"}`}
              aria-hidden
            >
              {isActive ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414-1.414L8 11.172 4.707 7.879a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8z" clipRule="evenodd" />
                </svg>
              ) : (
                <span className="font-medium">{idx + 1}</span>
              )}
            </div>;

          const segment = (idx < steps.length - 1) ? (
            <div
              key={`${s.key}-seg`}
              className={`flex-1 h-1 ${idx < activeIndex ? "bg-blue-500" : "bg-gray-200"}`}
              aria-hidden
            />
          ) : null;

          return (
            <React.Fragment key={s.key}>
              {circle}
              {segment}
            </React.Fragment>
          );
        })}
      </div>

      {/* Row 2: labels + dates aligned under each circle */}
      <div className="grid grid-cols-4 mt-2 px-4 text-center">
        {steps.map((s, idx) => {
          const isActive = idx <= activeIndex;
          return (
            <div key={`${s.key}-meta`} className="px-2">
              <div className={`text-xs font-medium ${isActive ? "text-gray-800" : "text-gray-500"}`}>
                {s.label}
              </div>
              <div className="mt-1 text-[11px] text-gray-500">
                {s.date ? fmt(s.date) : <span className="italic text-gray-400">—</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
