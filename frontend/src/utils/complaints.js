export const STATUS_OPTIONS = ["Pending", "Assigned", "In Progress", "Resolved"];

export const normalizeStatus = (raw) => {
  if (!raw) return "Pending";
  const k = String(raw).replace(/\s+/g, "").toLowerCase();
  if (k === "pending")    return "Pending";
  if (k === "assigned")   return "Assigned";
  if (k === "inprogress") return "In Progress";
  if (k === "resolved")   return "Resolved";
  return raw;
};

export const getAssigneeDisplay = (c, staffOptions = []) => {
  if (c?.assignedTo && typeof c.assignedTo === 'object') return c.assignedTo.name || 'Not assigned yet';
  if (typeof c?.assignedTo === 'string') {
    const s = staffOptions.find(x => x._id === c.assignedTo);
    return s?.name || '--Not assigned yet--';
  }
  return '--Not assigned yet--';
};
