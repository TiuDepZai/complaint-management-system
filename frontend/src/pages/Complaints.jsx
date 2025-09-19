// import React, { useEffect, useMemo, useState } from "react";
// import { useSearchParams } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import ComplaintForm from "../components/ComplaintForm";
// import EditComplaintModal from "../components/EditComplaintModal";
// import axiosInstance from "../axiosConfig";

// /* ---------- Static staff directory used by the admin assignment dropdown ---------- */
// const ASSIGNEES = [
//   { id: "u-ed",  name: "Eduardo Araujo", email: "eduardo@example.com" },
//   { id: "u-sc",  name: "Scarlett Rojas",  email: "scarlett@example.com" },
//   { id: "u-tiu", name: "Tiu",            email: "tiu@example.com" },
// ];

// const ASSIGNEE_MAP = {
//   "u-ed":  "Eduardo Araujo",
//   "u-sc":  "Scarlett Rojas",
//   "u-tiu": "Tiu",
//   "eduardo@example.com": "Eduardo Araujo",
//   "scarlett@example.com": "Scarlett Rojas",
//   "tiu@example.com": "Tiu",
// };

// const STATUS_OPTIONS = ["Pending", "Assigned", "In Progress", "Resolved"];

// /* --------------------------------- Helpers --------------------------------- */
// const normalizeStatus = (raw) => {
//   if (!raw) return "Pending";
//   const k = String(raw).replace(/\s+/g, "").toLowerCase();
//   if (k === "pending")    return "Pending";
//   if (k === "assigned")   return "Assigned";
//   if (k === "inprogress") return "In Progress";
//   if (k === "resolved")   return "Resolved";
//   if (k === "closed")     return "Resolved"; // map legacy "Closed" to Resolved
//   return raw;
// };

// const getAssigneeDisplay = (c) => {
//   // Friendly names first
//   if (c?.assignedTo?.name) return c.assignedTo.name;
//   if (c?.assignedToName)   return c.assignedToName;
//   if (c?.assignee?.name)   return c.assignee.name;
//   if (c?.assigneeName)     return c.assigneeName;

//   // Emails
//   const email =
//     c?.assignedToEmail ||
//     c?.assigneeEmail ||
//     c?.assignedTo?.email ||
//     "";
//   if (email && ASSIGNEE_MAP[email]) return ASSIGNEE_MAP[email];
//   if (email) return email;

//   // IDs
//   const id =
//     c?.assignedToId ||
//     c?.assignedTo?.id ||
//     (typeof c?.assignedTo === "string" ? c.assignedTo : "") ||
//     "";
//   if (id && ASSIGNEE_MAP[id]) return ASSIGNEE_MAP[id];
//   if (id) return id;

//   return "-";
// };

// const getAssigneeId = (c) => {
//   if (c?.assignedTo?.id) return c.assignedTo.id;
//   if (c?.assignedToId) return c.assignedToId;
//   const email =
//     c?.assignedToEmail ||
//     c?.assignedTo?.email ||
//     "";
//   const foundByEmail = ASSIGNEES.find(a => a.email === email);
//   if (foundByEmail) return foundByEmail.id;
//   if (typeof c?.assignedTo === "string") return c.assignedTo;
//   return "";
// };

// const StatusPill = ({ value }) => {
//   const v = normalizeStatus(value);
//   const cls =
//     v === "Pending"    ? "bg-amber-50 text-amber-700 border-amber-200" :
//     v === "Assigned"   ? "bg-violet-50 text-violet-700 border-violet-200" :
//     v === "In Progress"? "bg-orange-50 text-orange-700 border-orange-200" :
//     /* Resolved */       "bg-green-50 text-green-700 border-green-200";
//   return (
//     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
//       {v}
//     </span>
//   );
// };

// const PriorityPill = ({ value }) => {
//   const v = (value || "").toLowerCase();
//   const cls =
//     v === "urgent" ? "bg-red-50 text-red-700 border-red-200" :
//     v === "high"   ? "bg-rose-50 text-rose-700 border-rose-200" :
//     v === "medium" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
//                      "bg-green-50 text-green-700 border-green-200";
//   return (
//     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
//       {value || "-"}
//     </span>
//   );
// };

// /* -------------------- Inline cells (assignment & status) -------------------- */
// function AssigneeCell({ complaint, isAdmin, token, onUpdated }) {
//   const [saving, setSaving] = useState(false);
//   const currentId = getAssigneeId(complaint);

//   const saveUpdate = async (payload) => {
//     const res = await axiosInstance.put(
//       `/api/complaints/${complaint._id}`,
//       payload,
//       { headers: { Authorization: `Bearer ${token}` } }
//     );
//     onUpdated(res.data);
//   };

//   const handleChange = async (e) => {
//     const assigneeId = e.target.value;
//     const chosen = ASSIGNEES.find(a => a.id === assigneeId) || null;

//     try {
//       setSaving(true);

//       if (chosen) {
//         await saveUpdate({
//           assignedToId: chosen.id,
//           assignedToName: chosen.name,
//           assignedToEmail: chosen.email,
//           // if status is still Pending, bump to Assigned automatically
//           status: normalizeStatus(complaint.status) === "Pending" ? "Assigned" : complaint.status,
//         });
//       } else {
//         // unassign -> set back to Pending if it was Assigned (optional rule)
//         const nextStatus = normalizeStatus(complaint.status) === "Assigned" ? "Pending" : complaint.status;
//         await saveUpdate({
//           assignedToId: null,
//           assignedToName: null,
//           assignedToEmail: null,
//           status: nextStatus,
//         });
//       }
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (!isAdmin) {
//     return <div>{getAssigneeDisplay(complaint)}</div>;
//   }

//   return (
//     <select
//       value={currentId}
//       onChange={handleChange}
//       disabled={saving}
//       className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm"
//       title="Assign to"
//     >
//       <option value="">— Unassigned —</option>
//       {ASSIGNEES.map(a => (
//         <option key={a.id} value={a.id}>{a.name}</option>
//       ))}
//     </select>
//   );
// }

// function StatusCell({ complaint, user, token, onUpdated }) {
//   const status = normalizeStatus(complaint.status);
//   const assigneeId = getAssigneeId(complaint);

//   // Only the assignee can change the status
//   const userId = user?.id || user?._id || user?.userId || "";
//   const isAssignee =
//     assigneeId === userId ||
//     complaint?.assignedToEmail === user?.email ||
//     complaint?.assignedTo?.email === user?.email;

//   const [saving, setSaving] = useState(false);

//   const saveStatus = async (newStatus) => {
//     const res = await axiosInstance.put(
//       `/api/complaints/${complaint._id}`,
//       { status: newStatus },
//       { headers: { Authorization: `Bearer ${token}` } }
//     );
//     onUpdated(res.data);
//   };

//   const handleChange = async (e) => {
//     try {
//       setSaving(true);
//       await saveStatus(e.target.value);
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (!isAssignee) {
//     return <StatusPill value={status} />;
//   }

//   return (
//     <select
//       value={status}
//       onChange={handleChange}
//       disabled={saving}
//       className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm"
//       title="Change status"
//     >
//       {STATUS_OPTIONS.map(s => (
//         <option key={s} value={s}>{s}</option>
//       ))}
//     </select>
//   );
// }

// /* --------------------------------- Page --------------------------------- */
// export default function Complaints() {
//   const { user } = useAuth();
//   const token = user?.token;
//   const [searchParams, setSearchParams] = useSearchParams();

//   const [open, setOpen] = useState(false);
//   const [pageSuccess, setPageSuccess] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [loadError, setLoadError] = useState("");

//   const [complaints, setComplaints] = useState([]);
//   const [editingComplaint, setEditingComplaint] = useState(null);
//   const [deletingId, setDeletingId] = useState(null);

//   const [q, setQ] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");

//   const isAdmin = user?.role === "admin";
//   const showUserCol = isAdmin && searchParams.get("all") === "1";

//   useEffect(() => {
//     if (searchParams.get("new") === "1" && token) setOpen(true);
//   }, [searchParams, token]);

//   const closeForm = () => {
//     setOpen(false);
//     if (searchParams.get("new")) {
//       const sp = new URLSearchParams(searchParams);
//       sp.delete("new");
//       setSearchParams(sp, { replace: true });
//     }
//   };

//   const fetchComplaints = async () => {
//     if (!token) {
//       setComplaints([]);
//       setLoading(false);
//       return;
//     }
//     try {
//       setLoading(true);
//       setLoadError("");

//       const wantAll = searchParams.get("all") === "1";
//       const qs = isAdmin && wantAll ? "?all=1" : "";

//       const res = await axiosInstance.get(`/api/complaints${qs}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setComplaints(res.data || []);
//     } catch {
//       setLoadError("Failed to load complaints.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchComplaints();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [token, searchParams.toString()]);

//   const applyUpdate = (updated) => {
//     setComplaints((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
//   };

//   const handleSubmitted = async (created) => {
//     closeForm();
//     setPageSuccess(`Complaint submitted successfully! Reference: ${created.reference}`);
//     setTimeout(() => setPageSuccess(""), 4000);
//     await fetchComplaints();
//   };

//   const handleUpdated = async (updated) => {
//     setEditingComplaint(null);
//     applyUpdate(updated);
//     setPageSuccess("Complaint updated successfully!");
//     setTimeout(() => setPageSuccess(""), 3000);
//   };

//   const canEdit = (c) => {
//     if (!user) return false;
//     if (user.role === "admin") return true;
//     const uid = user.id || user._id;
//     const ownerId = c.createdBy?._id || c.createdBy;
//     return String(uid) === String(ownerId);
//   };
//   const canDelete = canEdit;

//   const handleDelete = async (complaint) => {
//     const ok = window.confirm(`Delete complaint "${complaint.reference}"?`);
//     if (!ok) return;
//     try {
//       setDeletingId(complaint._id);
//       await axiosInstance.delete(`/api/complaints/${complaint._id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setComplaints((prev) => prev.filter((c) => c._id !== complaint._id));
//       setPageSuccess("Complaint deleted successfully!");
//       setTimeout(() => setPageSuccess(""), 3000);
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   /* ------------------------ Filtering & dashboard counts ------------------------ */
//   const filtered = useMemo(() => {
//     const text = q.trim().toLowerCase();
//     return complaints.filter((c) => {
//       const ref = (c?.reference ?? "").toLowerCase();
//       const desc = (c?.description ?? "").toLowerCase();
//       const cat = (c?.category?.name ?? "").toLowerCase();
//       const status = normalizeStatus(c?.status ?? "").toLowerCase();
//       const assigned = getAssigneeDisplay(c).toLowerCase();

//       const matchesText =
//         !text || ref.includes(text) || desc.includes(text) || cat.includes(text) || status.includes(text) || assigned.includes(text);

//       const statusOk =
//         statusFilter === "all" ||
//         (statusFilter === "pending"    && status === "pending") ||
//         (statusFilter === "assigned"   && status === "assigned") ||
//         (statusFilter === "inprogress" && status === "inprogress") ||
//         (statusFilter === "resolved"   && status === "resolved");

//       return matchesText && statusOk;
//     });
//   }, [complaints, q, statusFilter]);

//   const countBy = (pred) => complaints.filter(pred).length;
//   const statPending  = countBy(c => normalizeStatus(c.status) === "Pending");
//   const statAssigned = countBy(c => normalizeStatus(c.status) === "Assigned");
//   const statProgress = countBy(c => normalizeStatus(c.status) === "In Progress");
//   const statResolved = countBy(c => normalizeStatus(c.status) === "Resolved");

//   const headerCols = showUserCol ? "grid-cols-7" : "grid-cols-6";

//   return (
//     <div className="min-h-screen bg-gray-50 p-6 pt-28">
//       {/* Header */}
//       <div className="mb-6">
//         <h1 className="text-2xl font-semibold text-gray-800">
//           Welcome{user?.name ? `, ${user.name}!` : "!"}
//         </h1>
//         <p className="text-sm text-gray-600">Here&apos;s the complaints dashboard for today.</p>
//       </div>

//       {/* Stat Cards */}
//       <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//         {[
//           { label: "Pending complaints", value: statPending,  icon: "⏳" },
//           { label: "Assigned complaints", value: statAssigned, icon: "👤" },
//           { label: "Complaints in progress", value: statProgress, icon: "🔧" },
//           { label: "Resolved complaints", value: statResolved, icon: "✅" },
//         ].map((s) => (
//           <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
//             <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
//               <span className="text-lg">{s.icon}</span>
//               <span>{s.label}</span>
//             </div>
//             <div className="text-3xl font-semibold text-gray-800">{s.value}</div>
//           </div>
//         ))}
//       </div>

//       {/* Success banner */}
//       {pageSuccess && (
//         <div
//           className="mb-4 flex items-center justify-between rounded-md border border-green-200 bg-green-50 px-4 py-2 text-green-800"
//           role="status"
//           aria-live="polite"
//         >
//           <span>{pageSuccess}</span>
//           <button onClick={() => setPageSuccess("")} className="text-green-700 hover:text-green-900" aria-label="Dismiss">
//             ×
//           </button>
//         </div>
//       )}

//       {/* Toolbar */}
//       <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//         <div className="relative w-full max-w-md">
//           <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
//             <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
//               <path d="M21 20.3l-4.1-4.1a8 8 0 1 0-1.4 1.4l4.1 4.1 1.4-1.4zM10 16a6 6 0 1 1 0-12 6 6 0 0 1 0 12z" />
//             </svg>
//           </span>
//           <input
//             value={q}
//             onChange={(e) => setQ(e.target.value)}
//             placeholder="Search complaints…"
//             className="w-full rounded-md border border-gray-300 pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7BEA] focus:border-[#2E7BEA]"
//           />
//           {q && (
//             <button
//               type="button"
//               onClick={() => setQ("")}
//               aria-label="Clear search"
//               className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
//             >
//               ×
//             </button>
//           )}
//         </div>

//         <div className="flex items-center gap-2">
//           <label htmlFor="status" className="text-sm text-gray-600">Status:</label>
//           <select
//             id="status"
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//             className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2E7BEA] focus:border-[#2E7BEA]"
//           >
//             <option value="all">All</option>
//             <option value="pending">Pending</option>
//             <option value="assigned">Assigned</option>
//             <option value="inprogress">In progress</option>
//             <option value="resolved">Resolved</option>
//           </select>
//         </div>

//         {/* Add button (non-admin users) */}
//         {token && user?.role !== "admin" && (
//           <button
//             onClick={() => {
//               setOpen(true);
//               const sp = new URLSearchParams(searchParams);
//               sp.set("new", "1");
//               setSearchParams(sp, { replace: true });
//             }}
//             className="rounded-md bg-[#1e4e8c] px-4 py-2 text-white shadow hover:bg-[#194374]"
//           >
//             Add new complaint
//           </button>
//         )}
//       </div>

//       {/* Table Card */}
//       <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
//         {/* Header row */}
//         <div className={`grid ${headerCols} items-center border-b bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700`}>
//           {showUserCol && <div>User</div>}
//           <div>Reference</div>
//           <div>Category</div>
//           <div>Status</div>
//           <div>Assigned To</div>
//           <div>Priority</div>
//           <div>Action</div>
//         </div>

//         {/* Body */}
//         {loading ? (
//           <div className="px-4 py-8 text-center text-gray-500">Loading…</div>
//         ) : loadError ? (
//           <div className="px-4 py-8 text-center text-red-600">{loadError}</div>
//         ) : filtered.length === 0 ? (
//           <div className="px-4 py-8 text-center text-gray-500">No complaints found.</div>
//         ) : (
//           filtered.map((c) => (
//             <div key={c._id} className={`grid ${headerCols} items-center border-b px-4 py-3 text-sm hover:bg-gray-50`}>
//               {showUserCol && (
//                 <div title={c.createdBy?.email}>
//                   {c.createdBy?.name || c.createdBy?.email || "-"}
//                 </div>
//               )}

//               <div className="font-mono">{c.reference}</div>
//               <div>{c.category?.name || "-"}</div>

//               {/* Status cell: pill for others, dropdown for the assignee */}
//               <StatusCell complaint={c} user={user} token={token} onUpdated={applyUpdate} />

//               {/* Assigned To cell: admin can assign inline */}
//               <AssigneeCell complaint={c} isAdmin={isAdmin} token={token} onUpdated={applyUpdate} />

//               <div><PriorityPill value={c.priority} /></div>

//               {/* Actions */}
//               <div className="flex items-center gap-2">
//                 {canEdit(c) && (
//                   <button
//                     type="button"
//                     onClick={() => setEditingComplaint(c)}
//                     className="rounded p-2 hover:bg-gray-100 focus:outline-none focus:ring focus:ring-blue-200"
//                     aria-label={`Edit ${c.reference}`}
//                     title="Edit"
//                   >
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
//                       <path d="M13.586 3.586a2 2 0 112.828 2.828l-8.5 8.5a2 2 0 01-.878.517l-3 .75a1 1 0 01-1.213-1.213l.75-3a2 2 0 01.517-.878l8.5-8.5zM12 5l3 3" />
//                     </svg>
//                   </button>
//                 )}

//                 {canDelete(c) && (
//                   <button
//                     type="button"
//                     onClick={() => handleDelete(c)}
//                     disabled={deletingId === c._id}
//                     className={`rounded p-2 focus:outline-none focus:ring focus:ring-red-200 ${
//                       deletingId === c._id ? "cursor-not-allowed opacity-50" : "hover:bg-red-50"
//                     }`}
//                     aria-label={`Delete ${c.reference}`}
//                     title="Delete"
//                   >
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="h-5 w-5 text-red-600"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth={2.5}
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     >
//                       <path d="M3 6h18" />
//                       <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
//                       <path d="M10 11v6" />
//                       <path d="M14 11v6" />
//                       <path d="M9 6V5a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v1" />
//                     </svg>
//                   </button>
//                 )}
//               </div>
//             </div>
//           ))
//         )}

//         {/* Footer: results + pager (static) */}
//         <div className="flex items-center justify-between px-5 pb-5 pt-3 text-sm text-gray-600">
//           <div>Showing {filtered.length} results</div>
//           <div className="flex items-center gap-2">
//             <button className="rounded-full border border-gray-300 bg-white px-2 py-1 hover:bg-gray-50" title="Previous">‹</button>
//             <button className="rounded-full border border-gray-300 bg-white px-2 py-1 hover:bg-gray-50" title="Next">›</button>
//           </div>
//         </div>
//       </div>

//       {/* Create Modal */}
//       {open && token && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
//           <div className="w-full max-w-lg">
//             <ComplaintForm onClose={closeForm} onSubmitted={handleSubmitted} />
//           </div>
//         </div>
//       )}

//       {/* Edit Modal (still available if you want to change more fields) */}
//       {editingComplaint && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
//           <div className="w-full max-w-lg">
//             <EditComplaintModal
//               complaint={editingComplaint}
//               onClose={() => setEditingComplaint(null)}
//               onUpdated={handleUpdated}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// src/pages/Complaints.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ComplaintForm from "../components/ComplaintForm";
import EditComplaintModal from "../components/EditComplaintModal";
import axiosInstance from "../axiosConfig";

/** ───────────────────────── helpers ───────────────────────── */
const STATUS_OPTIONS = ["Pending", "Assigned", "In Progress", "Resolved"];

const normalizeStatus = (raw) => {
  if (!raw) return "Pending";
  const k = String(raw).replace(/\s+/g, "").toLowerCase();
  if (k === "pending")    return "Pending";
  if (k === "assigned")   return "Assigned";
  if (k === "inprogress") return "In Progress";
  if (k === "resolved")   return "Resolved";
  if (k === "closed")     return "Resolved";
  return raw;
};

const getAssigneeDisplay = (c, staffOptions = []) => {
  if (c?.assignedTo && typeof c.assignedTo === 'object') return c.assignedTo.name || 'Not assigned yet';
  if (typeof c?.assignedTo === 'string') {
    const s = staffOptions.find(x => x._id === c.assignedTo);
    return s?.name || '--Not assigned yet--';
  }
  return '--Not assigned yet--';
};

const StatusPill = ({ value }) => {
  const v = normalizeStatus(value);
  const cls =
    v === "Pending"    ? "bg-amber-50 text-amber-700 border-amber-200" :
    v === "Assigned"   ? "bg-violet-50 text-violet-700 border-violet-200" :
    v === "In Progress"? "bg-orange-50 text-orange-700 border-orange-200" :
                         "bg-green-50 text-green-700 border-green-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls} whitespace-nowrap w-fit max-w-full`}>
      {v}
    </span>
  );
};

const PriorityPill = ({ value }) => {
  const v = (value || "").toLowerCase();
  const cls =
    v === "urgent" ? "bg-red-50 text-red-700 border-red-200" :
    v === "high"   ? "bg-rose-50 text-rose-700 border-rose-200" :
    v === "medium" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                     "bg-green-50 text-green-700 border-green-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {value || "-"}
    </span>
  );
};

/** ────────────────────── cells (assignment & status) ────────────────────── */
function AssigneeCell({ complaint, isAdmin, token, onUpdated, staffOptions }) {
  const [saving, setSaving] = useState(false);
  const currentStaffId =
    (complaint?.assignedTo && typeof complaint.assignedTo === 'object')
      ? complaint.assignedTo._id
      : (typeof complaint?.assignedTo === 'string' ? complaint.assignedTo : '');

  const assign = async (staffIdOrNull) => {
    const res = await axiosInstance.put(
      `/api/complaints/${complaint._id}/assign`,
      { staffId: staffIdOrNull },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    onUpdated(res.data); // backend returns populated assignedTo + status
  };

  const handleChange = async (e) => {
    const staffId = e.target.value || null;
    try {
      setSaving(true);
      await assign(staffId);
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return <div>{getAssigneeDisplay(complaint, staffOptions)}</div>;
  }

  // Admin dropdown: left-aligned and with more space before Priority
  return (
    <div className="justify-self-start">
      <select
        value={currentStaffId}
        onChange={handleChange}
        disabled={saving}
        title="Assign to"
        className="w-48 h-9 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm shadow-sm mr-6"
      >
        <option value="">— Unassigned —</option>
        {staffOptions.map((s) => (
          <option key={s._id} value={s._id}>{s.name}</option>
        ))}
      </select>
    </div>
  );
}

function StatusCell({ complaint, user, token, onUpdated }) {
  const status = normalizeStatus(complaint.status);
  const assigneeId = complaint?.assignedTo?._id;
  const userId = user?.id || user?._id || user?.userId || "";
  const isAssignee = assigneeId && String(assigneeId) === String(userId);
  const [saving, setSaving] = useState(false);

  const saveStatus = async (newStatus) => {
    const res = await axiosInstance.put(
      `/api/complaints/${complaint._id}`,
      { status: newStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    onUpdated(res.data);
  };

  const handleChange = async (e) => {
    try {
      setSaving(true);
      await saveStatus(e.target.value);
    } finally {
      setSaving(false);
    }
  };

  if (!isAssignee){
    return (
      <div className="justify-self-start">
        <StatusPill value={status} />
      </div>
    );
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={saving}
      className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm"
      title="Change status"
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}

/** ───────────────────────────── page ───────────────────────────── */
export default function Complaints() {
  const { user } = useAuth();
  const token = user?.token;
  const [searchParams, setSearchParams] = useSearchParams();

  const [open, setOpen] = useState(false);
  const [pageSuccess, setPageSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [complaints, setComplaints] = useState([]);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const isAdmin = user?.role === "admin";
  const showUserCol = isAdmin && searchParams.get("all") === "1";

  /** staff fetched from backend */
  const [staffOptions, setStaffOptions] = useState([]);
  const fetchStaff = async () => {
    if (!token || !isAdmin) return setStaffOptions([]);
    try {
      const res = await axiosInstance.get("/api/admin/staff", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaffOptions(res.data || []);
    } catch {
      setStaffOptions([]);
    }
  };

  useEffect(() => {
    if (searchParams.get("new") === "1" && token) setOpen(true);
  }, [searchParams, token]);

  const closeForm = () => {
    setOpen(false);
    if (searchParams.get("new")) {
      const sp = new URLSearchParams(searchParams);
      sp.delete("new");
      setSearchParams(sp, { replace: true });
    }
  };

  const fetchComplaints = async () => {
    if (!token) {
      setComplaints([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setLoadError("");

      const wantAll = isAdmin && searchParams.get("all") === "1";
      const qs = wantAll ? "?all=1" : "";
      const res = await axiosInstance.get(`/api/complaints${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints(res.data || []);
    } catch {
      setLoadError("Failed to load complaints.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, searchParams.toString()]);

  const applyUpdate = (updated) => {
    setComplaints(prev =>
      prev.map(c =>
        c._id === updated._id
          ? {
              ...c,
              ...updated,
              category:  updated.category  ?? c.category,
              createdBy: updated.createdBy ?? c.createdBy,
            }
          : c
      )
    );
  };

  const handleSubmitted = async (created) => {
    closeForm();
    setPageSuccess(`Complaint submitted successfully! Reference: ${created.reference}`);
    setTimeout(() => setPageSuccess(""), 4000);
    await fetchComplaints();
  };

  const handleUpdated = async (updated) => {
    setEditingComplaint(null);
    applyUpdate(updated);
    setPageSuccess("Complaint updated successfully!");
    setTimeout(() => setPageSuccess(""), 3000);
  };

  const canEdit = (c) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    const uid = user.id || user._id;
    const ownerId = c.createdBy?._id || c.createdBy;
    return String(uid) === String(ownerId);
  };
  const canDelete = canEdit;

  const handleDelete = async (complaint) => {
    const ok = window.confirm(`Delete complaint "${complaint.reference}"?`);
    if (!ok) return;
    try {
      setDeletingId(complaint._id);
      await axiosInstance.delete(`/api/complaints/${complaint._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints((prev) => prev.filter((c) => c._id !== complaint._id));
      setPageSuccess("Complaint deleted successfully!");
      setTimeout(() => setPageSuccess(""), 3000);
    } finally {
      setDeletingId(null);
    }
  };

  /** filtering & counts */
  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return complaints.filter((c) => {
      const ref = (c?.reference ?? "").toLowerCase();
      const desc = (c?.description ?? "").toLowerCase();
      const cat = (c?.category?.name ?? "").toLowerCase();
      const status = normalizeStatus(c?.status ?? "").toLowerCase();
      const assigned = (getAssigneeDisplay(c) || "").toLowerCase();

      const matchesText =
        !text || ref.includes(text) || desc.includes(text) || cat.includes(text) || status.includes(text) || assigned.includes(text);

      const statusOk =
        statusFilter === "all" ||
        (statusFilter === "pending"    && status === "pending") ||
        (statusFilter === "assigned"   && status === "assigned") ||
        (statusFilter === "inprogress" && status === "inprogress") ||
        (statusFilter === "resolved"   && status === "resolved");

      return matchesText && statusOk;
    });
  }, [complaints, q, statusFilter]);

  const countBy = (pred) => complaints.filter(pred).length;
  const statPending  = countBy(c => normalizeStatus(c.status) === "Pending");
  const statAssigned = countBy(c => normalizeStatus(c.status) === "Assigned");
  const statProgress = countBy(c => normalizeStatus(c.status) === "In Progress");
  const statResolved = countBy(c => normalizeStatus(c.status) === "Resolved");

  const headerCols = showUserCol ? "grid-cols-7" : "grid-cols-6";

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-28">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Welcome{user?.name ? `, ${user.name}!` : "!"}
        </h1>
        <p className="text-sm text-gray-600">Here's the complaints dashboard for today.</p>
      </div>

      {/* Stat Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Pending complaints", value: statPending,  icon: "⏳" },
          { label: "Assigned complaints", value: statAssigned, icon: "👤" },
          { label: "Complaints in progress", value: statProgress, icon: "🔧" },
          { label: "Resolved complaints", value: statResolved, icon: "✅" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
              <span className="text-lg">{s.icon}</span>
              <span>{s.label}</span>
            </div>
            <div className="text-3xl font-semibold text-gray-800">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Success banner */}
      {pageSuccess && (
        <div className="mb-4 flex items-center justify-between rounded-md border border-green-200 bg-green-50 px-4 py-2 text-green-800" role="status" aria-live="polite">
          <span>{pageSuccess}</span>
          <button onClick={() => setPageSuccess("")} className="text-green-700 hover:text-green-900" aria-label="Dismiss">×</button>
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-md">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 20.3l-4.1-4.1a8 8 1 0 0-1.4 1.4l4.1 4.1 1.4-1.4zM10 16a6 6 0 1 1 0-12 6 6 0 0 1 0 12z" />
            </svg>
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search complaints…"
            className="w-full rounded-md border border-gray-300 pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7BEA] focus:border-[#2E7BEA]"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="status" className="text-sm text-gray-600">Status:</label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2E7BEA] focus:border-[#2E7BEA]"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="inprogress">In progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {token && user?.role !== "admin" && (
          <button
            onClick={() => {
              setOpen(true);
              const sp = new URLSearchParams(searchParams);
              sp.set("new", "1");
              setSearchParams(sp, { replace: true });
            }}
            className="rounded-md bg-[#1e4e8c] px-4 py-2 text-white shadow hover:bg-[#194374]"
          >
            Add new complaint
          </button>
        )}
      </div>

      {/* Table Card */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Header row */}
        <div className={`grid ${headerCols} items-center border-b bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700`}>
          {showUserCol && <div>User</div>}
          <div>Reference</div>
          <div>Category</div>
          <div>Status</div>
          <div>Assigned To</div>
          <div className="pl-4">Priority</div> {/* 👈 extra space before Priority */}
          <div>Action</div>
        </div>

        {/* Body */}
        {loading ? (
          <div className="px-4 py-8 text-center text-gray-500">Loading…</div>
        ) : loadError ? (
          <div className="px-4 py-8 text-center text-red-600">{loadError}</div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">No complaints found.</div>
        ) : (
          filtered.map((c) => (
            <div key={c._id} className={`grid ${headerCols} items-center border-b px-4 py-3 text-sm hover:bg-gray-50`}>
              {showUserCol && (
                <div title={c.createdBy?.email}>
                  {c.createdBy?.name || c.createdBy?.email || "-"}
                </div>
              )}

              <div className="font-mono">{c.reference}</div>
              <div>{c.category?.name || "-"}</div>

              <StatusCell complaint={c} user={user} token={token} onUpdated={(u) => applyUpdate(u)} />

              <AssigneeCell
                complaint={c}
                isAdmin={isAdmin}
                token={token}
                onUpdated={(u) => applyUpdate(u)}
                staffOptions={staffOptions}
              />

              <div className="justify-self-start ml-4">
                {/* 👈 match header padding to create more space from the dropdown */}
                <PriorityPill value={c.priority} />
              </div>

              <div className="flex items-center gap-2">
                {canEdit(c) && (
                  <button
                    type="button"
                    onClick={() => setEditingComplaint(c)}
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
                    onClick={() => handleDelete(c)}
                    disabled={deletingId === c._id}
                    className={`rounded p-2 focus:outline-none focus:ring focus:ring-red-200 ${deletingId === c._id ? "cursor-not-allowed opacity-50" : "hover:bg-red-50"}`}
                    aria-label={`Delete ${c.reference}`}
                    title="Delete"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-red-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
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

        <div className="flex items-center justify-between px-5 pb-5 pt-3 text-sm text-gray-600">
          <div>Showing {filtered.length} results</div>
          <div className="flex items-center gap-2">
            <button className="rounded-full border border-gray-300 bg-white px-2 py-1 hover:bg-gray-50" title="Previous">‹</button>
            <button className="rounded-full border border-gray-300 bg-white px-2 py-1 hover:bg-gray-50" title="Next">›</button>
          </div>
        </div>
      </div>

      {open && token && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-lg">
            <ComplaintForm onClose={closeForm} onSubmitted={handleSubmitted} />
          </div>
        </div>
      )}

      {editingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-lg">
            <EditComplaintModal
              complaint={editingComplaint}
              onClose={() => setEditingComplaint(null)}
              onUpdated={handleUpdated}
            />
          </div>
        </div>
      )}
    </div>
  );
}
