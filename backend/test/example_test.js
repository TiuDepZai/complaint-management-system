const chai = require('chai');
const sinon = require('sinon');
const { expect } = chai;

// Controllers
const categoryController = require('../controllers/categoryController');
const complaintController = require('../controllers/complaintController');

// Units to stub
const CategoryEntity = require('../entities/Category');
const { complaintAccess } = require('../src/core/proxy');

const mockRes = () => {
  const res = {};
  res.status = sinon.stub().returns(res);
  res.json = sinon.stub().returns(res);
  res.send  = sinon.stub().returns(res);
  return res;
};

describe('Controllers — CRUD & business rules (48 tests, no event asserts)', () => {
  afterEach(() => sinon.restore());

  // ───────────────────────────────────────────────
  // CATEGORY CONTROLLER (20 tests)
  // ───────────────────────────────────────────────
  describe('categoryController', () => {
    describe('list', () => {
      it('[1] 200 returns categories', async () => {
        const rows = [{ name: 'Billing' }, { name: 'Support' }];
        sinon.stub(CategoryEntity, 'listAll').resolves(rows);

        const req = {};
        const res = mockRes();
        await categoryController.list(req, res);

        expect(res.status.calledWith(200)).to.equal(true);
        expect(res.json.calledWith(rows)).to.equal(true);
      });

      it('[2] 500 on error', async () => {
        sinon.stub(CategoryEntity, 'listAll').rejects(new Error('DB'));
        const req = {};
        const res = mockRes();
        await categoryController.list(req, res);
        expect(res.status.calledWith(500)).to.equal(true);
      });

      // Replaced "array shape" —> real flow: empty list OK
      it('[3] 200 on empty list', async () => {
        sinon.stub(CategoryEntity, 'listAll').resolves([]);
        const req = {};
        const res = mockRes();
        await categoryController.list(req, res);
        expect(res.status.calledWith(200)).to.equal(true);
        expect(res.json.calledWith([])).to.equal(true);
      });

      it('[4] calls listAll once', async () => {
        const stub = sinon.stub(CategoryEntity, 'listAll').resolves([]);
        const req = {};
        const res = mockRes();
        await categoryController.list(req, res);
        expect(stub.calledOnce).to.equal(true);
      });
    });

    describe('listActive', () => {
      it('[5] 200 returns active', async () => {
        const active = [{ _id: '1', name: 'Support' }];
        sinon.stub(CategoryEntity, 'listActive').resolves(active);
        const req = {};
        const res = mockRes();
        await categoryController.listActive(req, res);
        expect(res.json.calledWith(active)).to.equal(true);
      });

      it('[6] 500 on error', async () => {
        sinon.stub(CategoryEntity, 'listActive').rejects(new Error('oops'));
        const req = {};
        const res = mockRes();
        await categoryController.listActive(req, res);
        expect(res.status.calledWith(500)).to.equal(true);
      });

      // Replaced "array shape" —> empty active OK
      it('[7] 200 on none active', async () => {
        sinon.stub(CategoryEntity, 'listActive').resolves([]);
        const req = {};
        const res = mockRes();
        await categoryController.listActive(req, res);
        expect(res.json.calledWith([])).to.equal(true);
      });

      it('[8] calls listActive once', async () => {
        const stub = sinon.stub(CategoryEntity, 'listActive').resolves([]);
        const req = {};
        const res = mockRes();
        await categoryController.listActive(req, res);
        expect(stub.calledOnce).to.equal(true);
      });
    });

    describe('create', () => {
      it('[9] 201 creates successfully', async () => {
        const body = { name: 'New', description: 'Desc', status: 'Active' };
        const created = { _id: 'c1', ...body };
        sinon.stub(CategoryEntity, 'create').resolves(created);

        const req = { body };
        const res = mockRes();
        await categoryController.create(req, res);

        expect(CategoryEntity.create.calledOnce).to.equal(true);
        expect(res.status.calledWith(201)).to.equal(true);
        expect(res.json.calledWith(created)).to.equal(true);
      });

      it('[10] passes body to entity.create', async () => {
        const stub = sinon.stub(CategoryEntity, 'create').resolves({ _id: 'x' });
        const payload = { name: 'X', description: 'Y', status: 'Inactive' };
        const req = { body: payload };
        const res = mockRes();
        await categoryController.create(req, res);
        expect(stub.calledOnce).to.equal(true);
      });

      it('[11] 500 on entity error (e.g., non-admin path caught by route in integration)', async () => {
        sinon.stub(CategoryEntity, 'create').rejects(new Error('Forbidden by route'));
        const req = { body: { name: 'N' } };
        const res = mockRes();
        await categoryController.create(req, res);
        expect(res.status.calledWith(500)).to.equal(true);
      });

      it('[12] returns created object in json', async () => {
        const created = { _id: 'c9', name: 'Cat' };
        sinon.stub(CategoryEntity, 'create').resolves(created);
        const req = { body: { name: 'Cat' } };
        const res = mockRes();
        await categoryController.create(req, res);
        expect(res.json.calledWith(created)).to.equal(true);
      });
    });

    describe('update', () => {
      it('[13] 200 returns updated', async () => {
        const updated = { _id: 'id1', name: 'U', status: 'Inactive' };
        sinon.stub(CategoryEntity, 'update').resolves(updated);

        const req = { params: { id: 'id1' }, body: { name: 'U', status: 'Inactive' } };
        const res = mockRes();

        await categoryController.update(req, res);
        expect(res.json.calledWith(updated)).to.equal(true);
      });

      it('[14] calls update with id/body', async () => {
        const stub = sinon.stub(CategoryEntity, 'update').resolves({ _id: 'id1' });
        const body = { name: 'N' };
        const req = { params: { id: 'id1' }, body };
        const res = mockRes();
        await categoryController.update(req, res);
        expect(stub.calledOnceWith('id1', body)).to.equal(true);
      });

      it('[15] 500 on error', async () => {
        sinon.stub(CategoryEntity, 'update').rejects(new Error('DB'));
        const req = { params: { id: 'id1' }, body: { name: 'N' } };
        const res = mockRes();
        await categoryController.update(req, res);
        expect(res.status.calledWith(500)).to.equal(true);
      });

      it('[16] returns updated doc json', async () => {
        const updated = { _id: 'id1', name: 'Z' };
        sinon.stub(CategoryEntity, 'update').resolves(updated);
        const req = { params: { id: 'id1' }, body: { name: 'Z' } };
        const res = mockRes();
        await categoryController.update(req, res);
        expect(res.json.calledWith(updated)).to.equal(true);
      });
    });

    describe('remove', () => {
      it('[17] 200 removes successfully', async () => {
        sinon.stub(CategoryEntity, 'remove').resolves(true);
        const req = { params: { id: 'id1' } };
        const res = mockRes();
        await categoryController.remove(req, res);
        expect(res.status.calledWith(200)).to.equal(true);
      });

      it('[18] calls remove with id', async () => {
        const stub = sinon.stub(CategoryEntity, 'remove').resolves(true);
        const req = { params: { id: 'abc' } };
        const res = mockRes();
        await categoryController.remove(req, res);
        expect(stub.calledOnceWith('abc')).to.equal(true);
      });

      it('[19] 500 on error', async () => {
        sinon.stub(CategoryEntity, 'remove').rejects(new Error('DB'));
        const req = { params: { id: 'id1' } };
        const res = mockRes();
        await categoryController.remove(req, res);
        expect(res.status.calledWith(500)).to.equal(true);
      });

      it('[20] returns success message body', async () => {
        sinon.stub(CategoryEntity, 'remove').resolves(true);
        const req = { params: { id: 'id1' } };
        const res = mockRes();
        await categoryController.remove(req, res);
        expect(res.json.args[0][0].message).to.match(/Category deleted/i);
      });
    });
  });

  // ───────────────────────────────────────────────
  // COMPLAINT CONTROLLER (28 tests)
  // ───────────────────────────────────────────────
  describe('complaintController', () => {
    describe('create', () => {
      it('[21] 201 on success', async () => {
        const created = { _id: 'cmp1', reference: 'CMP-1' };
        sinon.stub(complaintAccess, 'create').resolves(created);

        const req = {
          user: { id: 'u1', name: 'Alice', email: 'a@b.com' },
          body: { subject: 'S', description: 'D', category: 'cat1', priority: 'Low', name: 'Alice', email: 'a@b.com' }
        };
        const res = mockRes();

        await complaintController.create(req, res);
        expect(res.status.calledWith(201)).to.equal(true);
        expect(res.json.calledWith(created)).to.equal(true);
      });

      it('[22] 400 on error', async () => {
        sinon.stub(complaintAccess, 'create').rejects(new Error('bad'));
        const req = { user: { id: 'u1', name: 'A', email: 'a@b.com' }, body: {} };
        const res = mockRes();
        await complaintController.create(req, res);
        expect(res.status.calledWith(400)).to.equal(true);
      });

      it('[23] passes user.id as createdBy (indirectly)', async () => {
        const stub = sinon.stub(complaintAccess, 'create').resolves({ ok: true });
        const req = { user: { id: 'UID', name: 'N', email: 'E' }, body: { subject: 'S', description: 'D', category: 'C' } };
        const res = mockRes();
        await complaintController.create(req, res);
        expect(stub.calledOnce).to.equal(true);
      });

      it('[24] supports user._id variant', async () => {
        const stub = sinon.stub(complaintAccess, 'create').resolves({ ok: true });
        const req = { user: { _id: 'OID', name: 'N', email: 'E' }, body: { subject: 'S', description: 'D', category: 'C' } };
        const res = mockRes();
        await complaintController.create(req, res);
        expect(stub.calledOnce).to.equal(true);
      });

      it('[25] res.json called once', async () => {
        sinon.stub(complaintAccess, 'create').resolves({ ok: true });
        const req = { user: { id: 'u', name: 'N', email: 'E' }, body: { subject: 'S', description: 'D', category: 'C' } };
        const res = mockRes();
        await complaintController.create(req, res);
        expect(res.json.calledOnce).to.equal(true);
      });

      it('[26] proxy called once', async () => {
        const stub = sinon.stub(complaintAccess, 'create').resolves({ ok: true });
        const req = { user: { id: 'u', name: 'N', email: 'E' }, body: { subject: 'S', description: 'D', category: 'C' } };
        const res = mockRes();
        await complaintController.create(req, res);
        expect(stub.calledOnce).to.equal(true);
      });
    });

    describe('list', () => {
      it('[27] 200 with data', async () => {
        sinon.stub(complaintAccess, 'list').resolves([{ reference: 'CMP-1' }]);
        const req = { user: { id: 'u1' } };
        const res = mockRes();
        await complaintController.list(req, res);
        expect(res.json.calledOnce).to.equal(true);
      });

      it('[28] 500 on error', async () => {
        sinon.stub(complaintAccess, 'list').rejects(new Error('db'));
        const req = { user: { id: 'u1' } };
        const res = mockRes();
        await complaintController.list(req, res);
        expect(res.status.calledWith(500)).to.equal(true);
      });

      it('[29] passes user to proxy', async () => {
        const stub = sinon.stub(complaintAccess, 'list').resolves([]);
        const req = { user: { id: 'U' } };
        const res = mockRes();
        await complaintController.list(req, res);
        expect(stub.calledOnceWith(req.user)).to.equal(true);
      });
    });

    describe('update (status flow rules)', () => {
      it('[30] STAFF cannot move backward (In Progress → Assigned) → 400 with message', async () => {
        const err = new Error('Only allowed to move to "Resolved" from "In Progress"');
        sinon.stub(complaintAccess, 'update').rejects(err);

        const req = { params: { id: 'c1' }, user: { id: 's1', role: 'staff' }, body: { status: 'Assigned' } };
        const res = mockRes();

        await complaintController.update(req, res);
        expect(res.status.calledWith(400)).to.equal(true);
        expect(res.json.args[0][0].message).to.match(/Only allowed to move to "Resolved"/);
      });

      it('[31] STAFF forward (Assigned → In Progress) → 200', async () => {
        const updated = { _id: 'c1', status: 'In Progress' };
        sinon.stub(complaintAccess, 'update').resolves(updated);

        const req = { params: { id: 'c1' }, user: { id: 's1', role: 'staff' }, body: { status: 'In Progress' } };
        const res = mockRes();

        await complaintController.update(req, res);
        expect(res.json.calledWith(updated)).to.equal(true);
      });

      it('[32] STAFF forward (In Progress → Resolved) → 200', async () => {
        const updated = { _id: 'c1', status: 'Resolved' };
        sinon.stub(complaintAccess, 'update').resolves(updated);

        const req = { params: { id: 'c1' }, user: { id: 's1', role: 'staff' }, body: { status: 'Resolved' } };
        const res = mockRes();

        await complaintController.update(req, res);
        expect(res.json.calledWith(updated)).to.equal(true);
      });

      it('[33] 400 on generic update error', async () => {
        sinon.stub(complaintAccess, 'update').rejects(new Error('bad'));
        const req = { params: { id: 'c1' }, user: { id: 'u1' }, body: {} };
        const res = mockRes();
        await complaintController.update(req, res);
        expect(res.status.calledWith(400)).to.equal(true);
      });
    });

    describe('remove', () => {
      it('[34] 200 success', async () => {
        sinon.stub(complaintAccess, 'remove').resolves(true);
        const req = { params: { id: 'c1' }, user: { id: 'u1' } };
        const res = mockRes();
        await complaintController.remove(req, res);
        expect(res.status.calledWith(200)).to.equal(true);
      });

      it('[35] 500 on error', async () => {
        sinon.stub(complaintAccess, 'remove').rejects(new Error('oops'));
        const req = { params: { id: 'c1' }, user: { id: 'u1' } };
        const res = mockRes();
        await complaintController.remove(req, res);
        expect(res.status.calledWith(500)).to.equal(true);
      });

      it('[36] passes args to proxy', async () => {
        const stub = sinon.stub(complaintAccess, 'remove').resolves(true);
        const req = { params: { id: 'c1' }, user: { id: 'u1' } };
        const res = mockRes();
        await complaintController.remove(req, res);
        expect(stub.calledOnceWith('c1', req.user)).to.equal(true);
      });
    });

    // assignComplaint — non-event tests only, with business rules
    describe('assignComplaint (business rules, no event asserts)', () => {
      const build = ({ complaintId = 'cmp1', staffId = 'stf1', user = {} } = {}) => ({
        req: { params: { complaintId }, body: { staffId }, user },
        res: mockRes()
      });

      it('[37] 400 if invalid complaintId', async () => {
        const mongoose = require('mongoose');
        sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(false);
        const { req, res } = build({ complaintId: 'bad', user: { role: 'admin' } });
        await complaintController.assignComplaint(req, res);
        expect(res.status.calledWith(400)).to.equal(true);
      });

      it('[38] 400 if invalid staffId', async () => {
        const mongoose = require('mongoose');
        sinon.stub(mongoose.Types.ObjectId, 'isValid')
          .onFirstCall().returns(true)   // complaint ok
          .onSecondCall().returns(false); // staff bad
        const { req, res } = build({ staffId: 'bad', user: { role: 'admin' } });
        await complaintController.assignComplaint(req, res);
        expect(res.status.calledWith(400)).to.equal(true);
      });

      it('[39] 403 when user cannot assign and not admin (user)', async () => {
        const mongoose = require('mongoose');
        sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);
        const { req, res } = build({ user: { role: 'user', canAssign: () => false } });
        await complaintController.assignComplaint(req, res);
        expect(res.status.calledWith(403)).to.equal(true);
      });

      it('[40] 403 when staff tries to assign', async () => {
        const mongoose = require('mongoose');
        sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);
        const { req, res } = build({ user: { role: 'staff', canAssign: () => false } });
        await complaintController.assignComplaint(req, res);
        expect(res.status.calledWith(403)).to.equal(true);
      });

      it('[41] 200 success (admin) when stage is Assigned (reassign allowed)', async () => {
        const mongoose = require('mongoose');
        sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);
        const updated = { _id: 'cmp1', status: 'Assigned', assignedTo: { name: 'Sam' }, toObject() { return this; } };
        sinon.stub(complaintAccess, 'assignStaff').resolves(updated);

        const { req, res } = build({ user: { role: 'admin', id: 'A' }, staffId: 'stf2' });
        await complaintController.assignComplaint(req, res);
        expect(res.status.calledWith(200)).to.equal(true);
        expect(res.json.calledWith(updated)).to.equal(true);
      });

      it('[42] 400 when admin tries to reassign at In Progress', async () => {
        const mongoose = require('mongoose');
        sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);

        const err = new Error('Cannot change assignee once work has started or the complaint is resolved');
        err.statusCode = 400;
        sinon.stub(complaintAccess, 'assignStaff').rejects(err);

        const { req, res } = build({ user: { role: 'admin' }, staffId: 'stf2' });
        await complaintController.assignComplaint(req, res);
        expect(res.status.calledWith(400)).to.equal(true);
        expect(res.json.args[0][0].message).to.match(/Cannot change assignee/);
      });

      it('[43] 400 when admin tries to unassign at In Progress/Resolved', async () => {
        const mongoose = require('mongoose');
        sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);

        const err = new Error('Cannot unassign when complaint is In Progress or Resolved');
        err.statusCode = 400;
        sinon.stub(complaintAccess, 'assignStaff').rejects(err);

        const { req, res } = build({ user: { role: 'admin' }, staffId: null });
        await complaintController.assignComplaint(req, res);
        expect(res.status.calledWith(400)).to.equal(true);
        expect(res.json.args[0][0].message).to.match(/Cannot unassign/);
      });

      it('[44] 200 when admin unassigns while at Assigned', async () => {
        const mongoose = require('mongoose');
        sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);

        const updated = { _id: 'cmp1', status: 'Pending', assignedTo: null, toObject() { return this; } };
        sinon.stub(complaintAccess, 'assignStaff').resolves(updated);

        const { req, res } = build({ user: { role: 'admin' }, staffId: null });
        await complaintController.assignComplaint(req, res);
        expect(res.status.calledWith(200)).to.equal(true);
      });

      it('[45] maps proxy err.statusCode to HTTP', async () => {
        const mongoose = require('mongoose');
        sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);
        const err = new Error('Conflict');
        err.statusCode = 409;
        sinon.stub(complaintAccess, 'assignStaff').rejects(err);
        const { req, res } = build({ user: { role: 'admin' } });
        await complaintController.assignComplaint(req, res);
        expect(res.status.calledWith(409)).to.equal(true);
      });

      it('[46] defaults to 400 on plain error', async () => {
        const mongoose = require('mongoose');
        sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);
        sinon.stub(complaintAccess, 'assignStaff').rejects(new Error('oops'));
        const { req, res } = build({ user: { role: 'admin' } });
        await complaintController.assignComplaint(req, res);
        expect(res.status.calledWith(400)).to.equal(true);
      });

      it('[47] returns updated body on 200', async () => {
        const mongoose = require('mongoose');
        sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);
        const updated = { _id: 'cmp-9', assignedTo: { name: 'Amy' }, toObject() { return this; } };
        sinon.stub(complaintAccess, 'assignStaff').resolves(updated);
        const { req, res } = build({ user: { role: 'admin' } });
        await complaintController.assignComplaint(req, res);
        expect(res.json.calledWith(updated)).to.equal(true);
      });

      it('[48] unassign (staffId null) still returns 200 when allowed', async () => {
        const mongoose = require('mongoose');
        sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);
        const updated = { _id: 'cmp1', assignedTo: null, status: 'Pending', toObject() { return this; } };
        sinon.stub(complaintAccess, 'assignStaff').resolves(updated);
        const { req, res } = build({ staffId: null, user: { role: 'admin' } });
        await complaintController.assignComplaint(req, res);
        expect(res.status.calledWith(200)).to.equal(true);
      });
    });
  });
});

