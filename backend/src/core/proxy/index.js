// Expose a singleton proxy wired to your existing Entity

const ComplaintEntity = require('../../../entities/Complaint');
const ComplaintAccessProxy = require('./ComplaintAccessProxy');

const complaintAccess = new ComplaintAccessProxy(ComplaintEntity);

module.exports = { complaintAccess };