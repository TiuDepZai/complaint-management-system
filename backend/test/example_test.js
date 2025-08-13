// example_test.js
const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');

const { expect } = chai;

const Category = require('../models/Category');
const Complaint = require('../models/Complaint');

// Category controller
const {
  list: categoryList,
  create: categoryCreate,
  update: categoryUpdate,
  remove: categoryRemove,
} = require('../controllers/categoryController');

// Complaint controller
const {
  create: complaintCreate,
  list: complaintList,
  update: complaintUpdate,
  remove: complaintRemove,
} = require('../controllers/complaintController');

describe('categoryController', () => {
  afterEach(() => {
    sinon.restore();
  });

  // Helpers
  const mockRes = () => {
    const res = {};
    res.status = sinon.stub().returns(res);
    res.json = sinon.stub().returns(res);
    res.send = sinon.stub().returns(res);
    return res;
  };

  //#region list
  describe('list', () => {
    it('returns categories sorted desc by createdAt', async () => {
      const docs = [{ name: 'A' }, { name: 'B' }];
      const sortStub = { sort: sinon.stub().withArgs({ createdAt: -1 }).returnsThis(), lean: sinon.stub().resolves(docs) };
      const findStub = sinon.stub(Category, 'find').returns(sortStub);

      const req = {};
      const res = mockRes();

      await categoryList(req, res);

      expect(findStub.calledOnce).to.be.true;
      expect(sortStub.sort.calledWith({ createdAt: -1 })).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(docs)).to.be.true;
    });

    it('returns 500 on error', async () => {
      sinon.stub(Category, 'find').throws(new Error('DB Error'));

      const req = {};
      const res = mockRes();

      await categoryList(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Server error', error: 'DB Error' })).to.be.true;
    });
  });
  //#endregion

  //#region create
  describe('create', () => {
    it('400 when name missing/blank', async () => {
      const req = { body: { name: '   ' } };
      const res = mockRes();

      await categoryCreate(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Name is required' })).to.be.true;
    });

    it('409 when name already exists (case-insensitive)', async () => {
      const req = { body: { name: 'Billing', description: 'x', status: 'Active' } };
      const res = mockRes();

      const collation = { collation: sinon.stub().returnsThis() };
      sinon.stub(Category, 'findOne').withArgs({ name: 'Billing' }).returns(collation);
      collation.collation.withArgs({ locale: 'en', strength: 2 }).resolves({ _id: new mongoose.Types.ObjectId() });

      await categoryCreate(req, res);

      expect(res.status.calledWith(409)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Category already exists' })).to.be.true;
    });

    it('creates with default status Active when invalid/missing', async () => {
      const req = { body: { name: 'Support', description: 'General' } }; // no status provided
      const res = mockRes();

      sinon.stub(Category, 'findOne').returns({ collation: sinon.stub().resolves(null) });
      const created = { _id: new mongoose.Types.ObjectId(), name: 'Support', description: 'General', status: 'Active' };
      const createStub = sinon.stub(Category, 'create').resolves(created);

      await categoryCreate(req, res);

      expect(createStub.calledOnceWithMatch({ name: 'Support', description: 'General', status: 'Active' })).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith(created)).to.be.true;
    });

    it('500 on error', async () => {
      const req = { body: { name: 'X' } };
      const res = mockRes();

      sinon.stub(Category, 'findOne').returns({ collation: sinon.stub().resolves(null) });
      sinon.stub(Category, 'create').throws(new Error('DB Error'));

      await categoryCreate(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Server error', error: 'DB Error' })).to.be.true;
    });
  });
  //#endregion

  //#region update
  describe('update', () => {
    it('updates fields and returns updated doc', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const req = { params: { id }, body: { name: 'New Name', description: 'New Desc', status: 'Inactive' } };
      const res = mockRes();

      // No duplicate
      sinon.stub(Category, 'findOne').returns({ collation: sinon.stub().resolves(null) });

      const updatedDoc = { _id: id, name: 'New Name', description: 'New Desc', status: 'Inactive' };
      const findByIdAndUpdateStub = sinon.stub(Category, 'findByIdAndUpdate')
        .withArgs(id, { name: 'New Name', description: 'New Desc', status: 'Inactive' }, sinon.match.object)
        .resolves(updatedDoc);

      await categoryUpdate(req, res);

      expect(findByIdAndUpdateStub.calledOnce).to.be.true;
      expect(res.json.calledWith(updatedDoc)).to.be.true;
    });

    it('400 if name provided but blank', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const req = { params: { id }, body: { name: '   ' } };
      const res = mockRes();

      await categoryUpdate(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Name is required' })).to.be.true;
    });

    it('409 if name collides with another category', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const otherId = new mongoose.Types.ObjectId().toString();
      const req = { params: { id }, body: { name: 'Duplicate' } };
      const res = mockRes();

      const col = { collation: sinon.stub().resolves({ _id: otherId }) };
      sinon.stub(Category, 'findOne').withArgs({ name: 'Duplicate' }).returns(col);
      col.collation.withArgs({ locale: 'en', strength: 2 });

      await categoryUpdate(req, res);

      expect(res.status.calledWith(409)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Category name already exists' })).to.be.true;
    });

    it('400 if status invalid', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const req = { params: { id }, body: { status: 'Paused' } };
      const res = mockRes();

      await categoryUpdate(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Invalid status' })).to.be.true;
    });

    it('404 if not found', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const req = { params: { id }, body: { name: 'Ok' } };
      const res = mockRes();

      sinon.stub(Category, 'findOne').returns({ collation: sinon.stub().resolves(null) });
      sinon.stub(Category, 'findByIdAndUpdate').resolves(null);

      await categoryUpdate(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Not found' })).to.be.true;
    });

    it('500 on error', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const req = { params: { id }, body: { name: 'Ok' } };
      const res = mockRes();

      sinon.stub(Category, 'findOne').returns({ collation: sinon.stub().resolves(null) });
      sinon.stub(Category, 'findByIdAndUpdate').throws(new Error('DB Error'));

      await categoryUpdate(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Server error', error: 'DB Error' })).to.be.true;
    });
  });
  //#endregion

  //#region remove
  describe('remove', () => {
    it('400 when id is invalid ObjectId', async () => {
      const req = { params: { id: 'not-an-id' } };
      const res = mockRes();

      const isValidStub = sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(false);

      await categoryRemove(req, res);

      expect(isValidStub.calledOnceWith('not-an-id')).to.be.true;
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Invalid category id' })).to.be.true;
    });

    it('409 when category is in use by complaints', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const req = { params: { id } };
      const res = mockRes();

      sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);
      sinon.stub(Complaint, 'exists').withArgs({ category: id }).resolves(true);

      await categoryRemove(req, res);

      expect(res.status.calledWith(409)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Category is in use by one or more complaints' })).to.be.true;
    });

    it('404 when category not found', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const req = { params: { id } };
      const res = mockRes();

      sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);
      sinon.stub(Complaint, 'exists').resolves(false);
      sinon.stub(Category, 'findByIdAndDelete').withArgs(id).resolves(null);

      await categoryRemove(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Not found' })).to.be.true;
    });

    it('204 on successful delete', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const req = { params: { id } };
      const res = mockRes();

      sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);
      sinon.stub(Complaint, 'exists').resolves(false);
      sinon.stub(Category, 'findByIdAndDelete').withArgs(id).resolves({ _id: id });

      await categoryRemove(req, res);

      expect(res.status.calledWith(204)).to.be.true;
      expect(res.send.calledOnce).to.be.true;
    });

    it('500 on error', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const req = { params: { id } };
      const res = mockRes();

      sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);
      sinon.stub(Complaint, 'exists').throws(new Error('DB Error'));

      await categoryRemove(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Server error', error: 'DB Error' })).to.be.true;
    });
  });
  //#endregion
});


// =====================
//  Complaint Controller
// =====================
describe('complaintController', () => {
  afterEach(() => {
    sinon.restore();
  });

  const mockRes = () => {
    const res = {};
    res.status = sinon.stub().returns(res);
    res.json = sinon.stub().returns(res);
    res.send = sinon.stub().returns(res);
    return res;
  };

  // helper: make findById(...).select('createdBy') => resolves(result)
  const stubFindByIdSelect = (result) =>
    sinon.stub(Complaint, 'findById').returns({
      select: sinon.stub().withArgs('createdBy').resolves(result),
    });

  //#region create
  describe('create', () => {
    it('400 when required fields missing', async () => {
      const req = { body: { name: ' ', email: '', subject: '', description: '', category: '' }, user: { id: 'u1' } };
      const res = mockRes();

      await complaintCreate(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'All fields are required' })).to.be.true;
    });

    it('400 when email invalid', async () => {
      const req = {
        body: { name: 'A', email: 'bad', subject: 's', description: 'd', category: new mongoose.Types.ObjectId().toString(), priority: 'Low' },
        user: { id: 'u1' },
      };
      const res = mockRes();

      sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);

      await complaintCreate(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Invalid email address' })).to.be.true;
    });

    it('400 when priority invalid', async () => {
      const req = {
        body: { name: 'A', email: 'a@b.com', subject: 's', description: 'd', category: new mongoose.Types.ObjectId().toString(), priority: 'X' },
        user: { id: 'u1' },
      };
      const res = mockRes();

      sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);

      await complaintCreate(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Invalid priority' })).to.be.true;
    });

    it('400 when category id invalid', async () => {
      const req = {
        body: { name: 'A', email: 'a@b.com', subject: 's', description: 'd', category: 'badid', priority: 'Low' },
        user: { id: 'u1' },
      };
      const res = mockRes();

      sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(false);

      await complaintCreate(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Invalid category id' })).to.be.true;
    });

    it('400 when category not found or inactive', async () => {
      const req = {
        body: { name: 'A', email: 'a@b.com', subject: 's', description: 'd', category: new mongoose.Types.ObjectId().toString(), priority: 'Low' },
        user: { id: 'u1' },
      };
      const res = mockRes();

      sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);
      const sel = { select: sinon.stub().returnsThis(), lean: sinon.stub().resolves(null) };
      sinon.stub(Category, 'findOne').returns(sel);

      await complaintCreate(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Category not found or inactive' })).to.be.true;
    });

    it('201 on create success', async () => {
      const req = {
        body: {
          name: 'A',
          email: 'a@b.com',
          subject: 's',
          description: 'd',
          category: new mongoose.Types.ObjectId().toString(),
          priority: 'Low',
        },
        user: { id: new mongoose.Types.ObjectId().toString() },
      };
      const res = mockRes();

      sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);
      const sel = { select: sinon.stub().returnsThis(), lean: sinon.stub().resolves({ _id: req.body.category }) };
      sinon.stub(Category, 'findOne').returns(sel);

      const createdDoc = { _id: new mongoose.Types.ObjectId(), ...req.body, createdBy: req.user.id, reference: 'CMP-123456-XYZ' };
      const createStub = sinon.stub(Complaint, 'create').resolves(createdDoc);

      await complaintCreate(req, res);

      expect(createStub.calledOnceWithMatch({
        name: 'A',
        email: 'a@b.com',
        subject: 's',
        description: 'd',
        category: req.body.category,
        priority: 'Low',
        createdBy: req.user.id,
      })).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith(createdDoc)).to.be.true;
    });

    it('500 on error', async () => {
      const req = {
        body: {
          name: 'A',
          email: 'a@b.com',
          subject: 's',
          description: 'd',
          category: new mongoose.Types.ObjectId().toString(),
          priority: 'Low',
        },
        user: { id: 'u1' },
      };
      const res = mockRes();

      sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);
      sinon.stub(Category, 'findOne').throws(new Error('DB Error'));

      await complaintCreate(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Server error', error: 'DB Error' })).to.be.true;
    });
  });
  //#endregion

  //#region list
  describe('list', () => {
    it('returns only my complaints by default', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const req = { user: { id: userId, role: 'user' }, query: {} };
      const res = mockRes();

      const docs = [{ reference: 'CMP-1', createdBy: userId }];
      const chain = {
        populate: sinon.stub().returnsThis(),
        sort: sinon.stub().returnsThis(),
        lean: sinon.stub().resolves(docs),
      };
      sinon.stub(Complaint, 'find').withArgs({ createdBy: userId }).returns(chain);

      await complaintList(req, res);

      expect(res.json.calledWith(docs)).to.be.true;
    });

    it('admin all=1 returns all complaints', async () => {
      const req = { user: { id: 'admin1', role: 'admin' }, query: { all: '1' } };
      const res = mockRes();

      const docs = [{ reference: 'CMP-1' }, { reference: 'CMP-2' }];
      const chain = {
        populate: sinon.stub().returnsThis(),
        sort: sinon.stub().returnsThis(),
        lean: sinon.stub().resolves(docs),
      };
      sinon.stub(Complaint, 'find').withArgs({}).returns(chain);

      await complaintList(req, res);

      expect(res.json.calledWith(docs)).to.be.true;
    });

    it('admin with invalid userId filter -> 400', async () => {
      const req = { user: { id: 'admin1', role: 'admin' }, query: { userId: 'bad' } };
      const res = mockRes();

      sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(false);

      await complaintList(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Invalid userId' })).to.be.true;
    });

    it('500 on error', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const req = { user: { id: userId, role: 'user' }, query: {} };
      const res = mockRes();

      sinon.stub(Complaint, 'find').throws(new Error('DB Error'));

      await complaintList(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Server error', error: 'DB Error' })).to.be.true;
    });
  });
  //#endregion

  //#region update
  describe('update', () => {
    it('400 if invalid complaint id', async () => {
      const req = { params: { id: 'bad' }, body: {} , user: { id: 'u1', role: 'user' } };
      const res = mockRes();

      sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(false);

      await complaintUpdate(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Invalid complaint id' })).to.be.true;
    });

    it('404 if not found', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const req = { params: { id }, body: {}, user: { id: 'u1', role: 'user' } };
      const res = mockRes();

      sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);
      stubFindByIdSelect(null); // findById(...).select('createdBy') -> null

      await complaintUpdate(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Not found' })).to.be.true;
    });

    it('403 if not owner and not admin', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const req = { params: { id }, body: {}, user: { id: 'u1', role: 'user' } };
      const res = mockRes();

      const existing = { createdBy: new mongoose.Types.ObjectId().toString() };
      sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);
      stubFindByIdSelect(existing);

      await complaintUpdate(req, res);

      expect(res.status.calledWith(403)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Forbidden' })).to.be.true;
    });

    it('400 if description provided but blank', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const ownerId = new mongoose.Types.ObjectId().toString();
      const req = { params: { id }, body: { description: '   ' }, user: { id: ownerId, role: 'user' } };
      const res = mockRes();

      sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);
      stubFindByIdSelect({ createdBy: ownerId });

      await complaintUpdate(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Description is required' })).to.be.true;
    });

    it('400 if category invalid id', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const ownerId = new mongoose.Types.ObjectId().toString();
      const req = { params: { id }, body: { category: 'bad' }, user: { id: ownerId, role: 'user' } };
      const res = mockRes();

      sinon.stub(mongoose.Types.ObjectId, 'isValid')
        .onCall(0).returns(true)   // complaint id valid
        .onCall(1).returns(false); // category id invalid
      stubFindByIdSelect({ createdBy: ownerId });

      await complaintUpdate(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Invalid category id' })).to.be.true;
    });

    it('400 if category not found/inactive', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const ownerId = new mongoose.Types.ObjectId().toString();
      const catId = new mongoose.Types.ObjectId().toString();

      const req = { params: { id }, body: { category: catId }, user: { id: ownerId, role: 'user' } };
      const res = mockRes();

      sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);
      stubFindByIdSelect({ createdBy: ownerId });
      const sel = { select: sinon.stub().returnsThis(), lean: sinon.stub().resolves(null) };
      sinon.stub(Category, 'findOne').returns(sel);

      await complaintUpdate(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Category not found or inactive' })).to.be.true;
    });

    it('200 on successful update (returns populated doc)', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const ownerId = new mongoose.Types.ObjectId().toString();
      const catId = new mongoose.Types.ObjectId().toString();

      const req = {
        params: { id },
        body: { description: 'New desc', category: catId },
        user: { id: ownerId, role: 'user' },
      };
      const res = mockRes();

      // Validations / ownership
      sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);
      stubFindByIdSelect({ createdBy: ownerId });
      const sel = { select: sinon.stub().returnsThis(), lean: sinon.stub().resolves({ _id: catId }) };
      sinon.stub(Category, 'findOne').returns(sel);

      // Return a thenable-like query object supporting populate().populate().then(...)
      const updatedDoc = {
        _id: id,
        description: 'New desc',
        category: { _id: catId, name: 'Active Cat', status: 'Active' },
        createdBy: { _id: ownerId, name: 'U', email: 'u@x.com' },
      };
      const queryLike = {
        populate: sinon.stub().returnsThis(),
        then: (resolve) => resolve(updatedDoc),
        catch: () => {},
      };
      sinon.stub(Complaint, 'findByIdAndUpdate').returns(queryLike);

      await complaintUpdate(req, res);

      expect(res.json.calledWith(updatedDoc)).to.be.true;
    });

    it('500 on error', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const ownerId = new mongoose.Types.ObjectId().toString();
      const req = { params: { id }, body: { description: 'ok' }, user: { id: ownerId, role: 'user' } };
      const res = mockRes();

      sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);
      sinon.stub(Complaint, 'findById').throws(new Error('DB Error'));

      await complaintUpdate(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Server error', error: 'DB Error' })).to.be.true;
    });
  });
  //#endregion

  //#region remove
  describe('remove', () => {
    it('400 if invalid id', async () => {
      const req = { params: { id: 'bad' }, user: { id: 'u1', role: 'user' } };
      const res = mockRes();

      sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(false);

      await complaintRemove(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Invalid complaint id' })).to.be.true;
    });

    it('404 if not found', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const req = { params: { id }, user: { id: 'u1', role: 'user' } };
      const res = mockRes();

      sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);
      sinon.stub(Complaint, 'findById').returns({ select: sinon.stub().resolves(null) });

      await complaintRemove(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Not found' })).to.be.true;
    });

    it('403 if not owner and not admin', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const req = { params: { id }, user: { id: 'u1', role: 'user' } };
      const res = mockRes();

      const otherId = new mongoose.Types.ObjectId().toString();
      const doc = {
        createdBy: otherId,
        deleteOne: sinon.stub().resolves(),
      };
      const finder = {
        select: sinon.stub().resolves(doc),
      };

      sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);
      sinon.stub(Complaint, 'findById').returns(finder);

      await complaintRemove(req, res);

      expect(res.status.calledWith(403)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Forbidden' })).to.be.true;
    });

    it('204 on success (owner)', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const ownerId = new mongoose.Types.ObjectId().toString();
      const req = { params: { id }, user: { id: ownerId, role: 'user' } };
      const res = mockRes();

      const doc = {
        createdBy: ownerId,
        deleteOne: sinon.stub().resolves(),
      };
      const finder = { select: sinon.stub().resolves(doc) };

      sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);
      sinon.stub(Complaint, 'findById').returns(finder);

      await complaintRemove(req, res);

      expect(doc.deleteOne.calledOnce).to.be.true;
      expect(res.status.calledWith(204)).to.be.true;
      expect(res.send.calledOnce).to.be.true;
    });

    it('204 on success (admin)', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const req = { params: { id }, user: { id: 'admin', role: 'admin' } };
      const res = mockRes();

      const doc = {
        createdBy: new mongoose.Types.ObjectId().toString(),
        deleteOne: sinon.stub().resolves(),
      };
      const finder = { select: sinon.stub().resolves(doc) };

      sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);
      sinon.stub(Complaint, 'findById').returns(finder);

      await complaintRemove(req, res);

      expect(doc.deleteOne.calledOnce).to.be.true;
      expect(res.status.calledWith(204)).to.be.true;
      expect(res.send.calledOnce).to.be.true;
    });

    it('500 on error', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const req = { params: { id }, user: { id: 'u1', role: 'user' } };
      const res = mockRes();

      sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);
      sinon.stub(Complaint, 'findById').throws(new Error('DB Error'));

      await complaintRemove(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Server error', error: 'DB Error' })).to.be.true;
    });
  });
  //#endregion
});
