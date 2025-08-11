const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');

const { expect } = chai;

const Category = require('../models/Category');
const Complaint = require('../models/Complaint');
const { list, create, update, remove } = require('../controllers/categoryController');

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

      await list(req, res);

      expect(findStub.calledOnce).to.be.true;
      expect(sortStub.sort.calledWith({ createdAt: -1 })).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(docs)).to.be.true;
    });

    it('returns 500 on error', async () => {
      sinon.stub(Category, 'find').throws(new Error('DB Error'));

      const req = {};
      const res = mockRes();

      await list(req, res);

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

      await create(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Name is required' })).to.be.true;
    });

    it('409 when name already exists (case-insensitive)', async () => {
      const req = { body: { name: 'Billing', description: 'x', status: 'Active' } };
      const res = mockRes();

      const collation = { collation: sinon.stub().returnsThis() };
      sinon.stub(Category, 'findOne').withArgs({ name: 'Billing' }).returns(collation);
      collation.collation.withArgs({ locale: 'en', strength: 2 }).resolves({ _id: new mongoose.Types.ObjectId() });

      await create(req, res);

      expect(res.status.calledWith(409)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Category already exists' })).to.be.true;
    });

    it('creates with default status Active when invalid/missing', async () => {
      const req = { body: { name: 'Support', description: 'General' } }; // no status provided
      const res = mockRes();

      sinon.stub(Category, 'findOne').returns({ collation: sinon.stub().resolves(null) });
      const created = { _id: new mongoose.Types.ObjectId(), name: 'Support', description: 'General', status: 'Active' };
      const createStub = sinon.stub(Category, 'create').resolves(created);

      await create(req, res);

      expect(createStub.calledOnceWithMatch({ name: 'Support', description: 'General', status: 'Active' })).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith(created)).to.be.true;
    });

    it('500 on error', async () => {
      const req = { body: { name: 'X' } };
      const res = mockRes();

      sinon.stub(Category, 'findOne').returns({ collation: sinon.stub().resolves(null) });
      sinon.stub(Category, 'create').throws(new Error('DB Error'));

      await create(req, res);

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

      await update(req, res);

      expect(findByIdAndUpdateStub.calledOnce).to.be.true;
      expect(res.json.calledWith(updatedDoc)).to.be.true;
    });

    it('400 if name provided but blank', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const req = { params: { id }, body: { name: '   ' } };
      const res = mockRes();

      await update(req, res);

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

      await update(req, res);

      expect(res.status.calledWith(409)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Category name already exists' })).to.be.true;
    });

    it('400 if status invalid', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const req = { params: { id }, body: { status: 'Paused' } };
      const res = mockRes();

      await update(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Invalid status' })).to.be.true;
    });

    it('404 if not found', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const req = { params: { id }, body: { name: 'Ok' } };
      const res = mockRes();

      sinon.stub(Category, 'findOne').returns({ collation: sinon.stub().resolves(null) });
      sinon.stub(Category, 'findByIdAndUpdate').resolves(null);

      await update(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Not found' })).to.be.true;
    });

    it('500 on error', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const req = { params: { id }, body: { name: 'Ok' } };
      const res = mockRes();

      sinon.stub(Category, 'findOne').returns({ collation: sinon.stub().resolves(null) });
      sinon.stub(Category, 'findByIdAndUpdate').throws(new Error('DB Error'));

      await update(req, res);

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

      await remove(req, res);

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

      await remove(req, res);

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

      await remove(req, res);

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

      await remove(req, res);

      expect(res.status.calledWith(204)).to.be.true;
      expect(res.send.calledOnce).to.be.true;
    });

    it('500 on error', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const req = { params: { id } };
      const res = mockRes();

      sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);
      sinon.stub(Complaint, 'exists').throws(new Error('DB Error'));

      await remove(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Server error', error: 'DB Error' })).to.be.true;
    });
  });
  //#endregion
});
