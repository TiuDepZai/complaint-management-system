import React from "react";
import { StatusCell, AssigneeCell, PriorityPill } from "./index";

export default function ComplaintsTable({
  complaints,
  filteredComplaints,
  user,
  token,
  staffOptions,
  showUserCol,
  canEdit,
  canDelete,
  onUpdated,
  onDelete,
  deletingId
}) {
  const headerCols = showUserCol ? "grid-cols-7" : "grid-cols-6";

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className={`grid ${headerCols} items-center border-b bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700`}>
        {showUserCol && <div>User</div>}
        <div>Reference</div>
        <div>Category</div>
        <div>Status</div>
        <div>Assigned To</div>
        <div className="pl-4">Priority</div>
        <div>Action</div>
      </div>

      {/* Body */}
      {filteredComplaints.length === 0 ? (
        <div className="px-4 py-8 text-center text-gray-500">No complaints found.</div>
      ) : (
        filteredComplaints.map((c) => (
          <div key={c._id} className={`grid ${headerCols} items-center border-b px-4 py-3 text-sm hover:bg-gray-50`}>
            {showUserCol && (
              <div title={c.createdBy?.email}>
                {c.createdBy?.name || c.createdBy?.email || "-"}
              </div>
            )}

            <div className="font-mono">{c.reference}</div>
            <div>{c.category?.name || "-"}</div>

            <StatusCell complaint={c} user={user} token={token} onUpdated={onUpdated} />

            <AssigneeCell
              complaint={c}
              isAdmin={user?.role === "admin"}
              token={token}
              onUpdated={onUpdated}
              staffOptions={staffOptions}
            />

            <div className="justify-self-start ml-4">
              <PriorityPill value={c.priority} />
            </div>

            <div className="flex items-center gap-2">
              {canEdit(c) && (
                <button
                  type="button"
                  onClick={() => onUpdated(c)} // optional: could be open edit modal
                  className="rounded p-2 hover:bg-gray-100 focus:outline-none focus:ring focus:ring-blue-200"
                  aria-label={`Edit ${c.reference}`}
                  title="Edit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-8.5 8.5a2 2 0 01-.878.517l-3 .75a1 1 0 01-1.213-1.213l.75-3a2 2 0 01.517-.878l8.5-8.5zM12 5l3 3" />
                  </svg>
                </button>
              )}

              {canDelete(c) && (
                <button
                  type="button"
                  onClick={() => onDelete(c)}
                  disabled={deletingId === c._id}
                  className={`rounded p-2 focus:outline-none focus:ring focus:ring-red-200 ${deletingId === c._id ? "cursor-not-allowed opacity-50" : "hover:bg-red-50"}`}
                  aria-label={`Delete ${c.reference}`}
                  title="Delete"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V5a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v1" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
