// src/pages/Complaints.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ComplaintForm from "../components/ComplaintForm";
import EditComplaintModal from "../components/EditComplaintModal";
import axiosInstance from "../axiosConfig";
import { STATUS_OPTIONS, getAssigneeDisplay, normalizeStatus } from "../utils/complaints";
import ComplaintsTable from "../components/complaints/ComplaintsTable";

/* helper: robust check if complaint is assigned to current user */
function isAssignedToUser(c, user) {
  if (!c || !user) return false;
  const uid = String(user.id || user._id || user.userId || "");
  const uemail = (user.email || "").toLowerCase();

  const a = c.assignedTo;
  const aid = String(
    (a && (a._id || a.id || a.userId)) || (typeof a === "string" ? a : "")
  );
  const aemail =
    (a && (a.email || a.userEmail))
      ? String(a.email || a.userEmail).toLowerCase()
      : "";
  const asPlainEmail =
    typeof c.assignedTo === "string" && c.assignedTo.includes("@")
      ? c.assignedTo.toLowerCase()
      : "";

  return (
    (uid && aid && uid === aid) ||
    (uemail && aemail && uemail === aemail) ||
    (uemail && asPlainEmail && uemail === asPlainEmail)
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

      const res = await axiosInstance.get("/api/complaints", {
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
    setComplaints((prev) =>
      prev.map((c) =>
        c._id === updated._id
          ? {
              ...c,
              ...updated,
              category: updated.category ?? c.category,
              createdBy: updated.createdBy ?? c.createdBy,
              assignedTo: updated.assignedTo ?? c.assignedTo,
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
  if (user.role === "staff") return false;   // <- disallow staff edits
  if (user.role === "admin") return true;

  const uid = user.id || user._id;
  const ownerId = c.createdBy?._id || c.createdBy;
  const isOwner = uid && String(uid) === String(ownerId);
  const assignedToMe = isAssignedToUser(c, user);
  return Boolean(isOwner || assignedToMe);
};

  const canDelete = (c) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    const uid = user.id || user._id;
    const ownerId = c.createdBy?._id || c.createdBy;
    return String(uid) === String(ownerId);
  };

  const canTimeline = (c) => {
    if (!user) return false;
    if (user.role === "admin" ) return true;
    const uid = user.id || user._id;
    const ownerId = c.createdBy?._id || c.createdBy;
    return String(uid) === String(ownerId);
  }

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

  /** list used for the stat cards:
   *  - admin: all complaints
   *  - non-admin: complaints owned by the user OR assigned to them
   */
  const statsList = useMemo(() => {
    if (isAdmin) return complaints;

    const uid = String(user?.id || user?._id || "");
    return complaints.filter((c) => {
      const ownerId = String(c?.createdBy?._id || c?.createdBy || "");
      const isOwner = uid && ownerId && uid === ownerId;
      return isOwner || isAssignedToUser(c, user);
    });
  }, [complaints, isAdmin, user]);

  /** filtering & counts */
  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    const uid = String(user?.id || user?._id || "");

    return complaints.filter((c) => {
      const ref = (c?.reference ?? "").toLowerCase();
      const desc = (c?.description ?? "").toLowerCase();
      const cat = (c?.category?.name ?? "").toLowerCase();
      const status = normalizeStatus(c?.status ?? "").toLowerCase(); // "in progress" etc.
      const assigned = (getAssigneeDisplay(c) || "").toLowerCase();

      const matchesText =
        !text ||
        ref.includes(text) ||
        desc.includes(text) ||
        cat.includes(text) ||
        status.includes(text) ||
        assigned.includes(text);

      const statusOk =
        statusFilter === "all" ||
        (statusFilter === "pending" && status === "pending") ||
        (statusFilter === "assigned" && status === "assigned") ||
        (statusFilter === "inprogress" && status === "in progress") ||
        (statusFilter === "resolved" && status === "resolved");

      // non-admins see complaints they own OR are assigned to
      if (!isAdmin) {
        const ownerId = String(c?.createdBy?._id || c?.createdBy || "");
        const isOwner = uid && ownerId && uid === ownerId;
        if (!isOwner && !isAssignedToUser(c, user)) return false;
      }

      return matchesText && statusOk;
    });
  }, [complaints, q, statusFilter, isAdmin, user]);

  const countBy = (list, pred) => list.filter(pred).length;
  const statPending  = countBy(statsList, (c) => normalizeStatus(c.status) === "Pending");
  const statAssigned = countBy(statsList, (c) => normalizeStatus(c.status) === "Assigned");
  const statProgress = countBy(statsList, (c) => normalizeStatus(c.status) === "In Progress");
  const statResolved = countBy(statsList, (c) => normalizeStatus(c.status) === "Resolved");

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
        <div
          className="mb-4 flex items-center justify-between rounded-md border border-green-200 bg-green-50 px-4 py-2 text-green-800"
          role="status"
          aria-live="polite"
        >
          <span>{pageSuccess}</span>
          <button
            onClick={() => setPageSuccess("")}
            className="text-green-700 hover:text-green-900"
            aria-label="Dismiss"
          >
            ×
          </button>
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
            <option value="inprogress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {token && user?.role !== "admin" && user?.role !== "staff" && (
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
      <ComplaintsTable
        complaints={complaints}
        filteredComplaints={filtered}
        user={user}
        token={token}
        staffOptions={staffOptions}
        showUserCol={showUserCol}
        canEdit={canEdit}
        onEdit={setEditingComplaint}
        canTimeline={canTimeline}
        canDelete={canDelete}
        onUpdated={applyUpdate}
        onDelete={handleDelete}
        deletingId={deletingId}
      />

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
