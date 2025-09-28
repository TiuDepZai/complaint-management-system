const EventEmitter = require('events');

class ComplaintEvents extends EventEmitter {}
const complaintEvents = new ComplaintEvents();

module.exports = complaintEvents;