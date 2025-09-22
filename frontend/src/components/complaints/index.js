// import { STATUS_OPTIONS, getAssigneeDisplay,normalizeStatus } from "../../utils/complaints";
// import { useState } from "react";
// import axiosInstance from "../../axiosConfig";

// export const StatusPill = ({ value }) => {
//   const v = normalizeStatus(value);
//   const cls =
//     v === "Pending"    ? "bg-amber-50 text-amber-700 border-amber-200" :
//     v === "Assigned"   ? "bg-violet-50 text-violet-700 border-violet-200" :
//     v === "In Progress"? "bg-orange-50 text-orange-700 border-orange-200" :
//                          "bg-green-50 text-green-700 border-green-200";
//   return (
//     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls} whitespace-nowrap w-fit max-w-full`}>
//       {v}
//     </span>
//   );
// };

// export const PriorityPill = ({ value }) => {
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

// /** ────────────────────── cells (assignment & status) ────────────────────── */
// export function AssigneeCell({ complaint, isAdmin, token, onUpdated, staffOptions }) {
//   const [saving, setSaving] = useState(false);
//   const currentStaffId =
//     (complaint?.assignedTo && typeof complaint.assignedTo === 'object')
//       ? complaint.assignedTo._id
//       : (typeof complaint?.assignedTo === 'string' ? complaint.assignedTo : '');

//   const assign = async (staffIdOrNull) => {
//     const res = await axiosInstance.put(
//       `/api/complaints/${complaint._id}/assign`,
//       { staffId: staffIdOrNull },
//       { headers: { Authorization: `Bearer ${token}` } }
//     );
//     onUpdated(res.data); // backend returns populated assignedTo + status
//   };

//   const handleChange = async (e) => {
//     const staffId = e.target.value || null;
//     try {
//       setSaving(true);
//       await assign(staffId);
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (!isAdmin) {
//     return <div>{getAssigneeDisplay(complaint, staffOptions)}</div>;
//   }

//   // Admin dropdown: left-aligned and with more space before Priority
//   return (
//     <div className="justify-self-start">
//       <select
//         value={currentStaffId}
//         onChange={handleChange}
//         disabled={saving}
//         title="Assign to"
//         className="w-48 h-9 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm shadow-sm mr-6"
//       >
//         <option value="">— Unassigned —</option>
//         {staffOptions.map((s) => (
//           <option key={s._id} value={s._id}>{s.name}</option>
//         ))}
//       </select>
//     </div>
//   );
// }

// export function StatusCell({ isAdmin, complaint, user, token, onUpdated }) {
//   const status = normalizeStatus(complaint.status);
//   const [saving, setSaving] = useState(false);

//   const handleChange = async (e) => {
//     try {
//       setSaving(true);
//       const res = await axiosInstance.put(
//         `/api/complaints/${complaint._id}`,
//         { status: e.target.value },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       onUpdated(res.data);
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Non-admins see read-only status
//   if (!isAdmin) {
//     return (
//       <div className="justify-self-start">
//         <StatusPill value={status} />
//       </div>
//     );
//   }

//   // Admins can change status
//   return (
//     <select
//       value={status}
//       onChange={handleChange}
//       disabled={saving}
//       className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm"
//       title="Change status"
//     >
//       {STATUS_OPTIONS.map((s) => (
//         <option key={s} value={s}>{s}</option>
//       ))}
//     </select>
//   );
// }

// components/complaints/index.js
import { STATUS_OPTIONS, getAssigneeDisplay, normalizeStatus } from "../../utils/complaints";
import { useState } from "react";
import axiosInstance from "../../axiosConfig";

/* ─────────────── helpers ─────────────── */
function isAssignedToUser(complaint, user) {
  if (!complaint || !user) return false;
  const uid = String(user.id || user._id || user.userId || "");
  const a = complaint.assignedTo;

  // id can be object or string
  const aid = String(
    (a && (a._id || a.id || a.userId)) ||
      (typeof a === "string" ? a : "")
  );

  // some backends store email as plain string
  const uemail = (user.email || "").toLowerCase();
  const aemail =
    (a && (a.email || a.userEmail))
      ? String(a.email || a.userEmail).toLowerCase()
      : "";
  const asPlainEmail =
    typeof complaint.assignedTo === "string" && complaint.assignedTo.includes("@")
      ? complaint.assignedTo.toLowerCase()
      : "";

  return (
    (uid && aid && uid === aid) ||
    (uemail && aemail && uemail === aemail) ||
    (uemail && asPlainEmail && uemail === asPlainEmail)
  );
}

/* ─────────────── pills ─────────────── */
export const StatusPill = ({ value }) => {
  const v = normalizeStatus(value);
  const cls =
    v === "Pending"     ? "bg-amber-50 text-amber-700 border-amber-200" :
    v === "Assigned"    ? "bg-violet-50 text-violet-700 border-violet-200" :
    v === "In Progress" ? "bg-orange-50 text-orange-700 border-orange-200" :
                          "bg-green-50 text-green-700 border-green-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls} whitespace-nowrap w-fit max-w-full`}>
      {v}
    </span>
  );
};

export const PriorityPill = ({ value }) => {
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
export function AssigneeCell({ complaint, isAdmin, token, onUpdated, staffOptions }) {
  const [saving, setSaving] = useState(false);
  const currentStaffId =
    (complaint?.assignedTo && typeof complaint.assignedTo === "object")
      ? complaint.assignedTo._id
      : (typeof complaint?.assignedTo === "string" ? complaint.assignedTo : "");

  const assign = async (staffIdOrNull) => {
    const res = await axiosInstance.put(
      `/api/complaints/${complaint._id}/assign`,
      { staffId: staffIdOrNull },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    // backend sets status to "Assigned" when staffId provided, or "Pending" when unassigned
    onUpdated(res.data);
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

  // Admin dropdown (read/write assignment only)
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

export function StatusCell({ isAdmin, complaint, user, token, onUpdated }) {
  const status = normalizeStatus(complaint.status);
  const [saving, setSaving] = useState(false);

  // Admin: read-only (pill)
  if (isAdmin) {
    return (
      <div className="justify-self-start">
        <StatusPill value={status} />
      </div>
    );
  }

  // Staff: may change status ONLY if this complaint is assigned to them
  const isStaff = user?.role === "staff";
  const canStaffEdit = isStaff && isAssignedToUser(complaint, user);

  const handleChange = async (e) => {
    try {
      setSaving(true);
      const next = e.target.value;
      const res = await axiosInstance.put(
        `/api/complaints/${complaint._id}`,
        { status: next },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdated(res.data);
    } finally {
      setSaving(false);
    }
  };

  // Staff can change among these (no "Pending" unless re-open logic is allowed)
  const STAFF_STATUS_OPTIONS = ["Assigned", "In Progress", "Resolved"];

  if (canStaffEdit) {
    return (
      <select
        value={status}
        onChange={handleChange}
        disabled={saving}
        className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm"
        title="Change status"
      >
        {STAFF_STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    );
  }

  // Regular users & staff on others' complaints: read-only pill
  return (
    <div className="justify-self-start">
      <StatusPill value={status} />
    </div>
  );
}
