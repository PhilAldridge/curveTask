import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import Contract from '../src/models/Contract.js';
import ContractService from '../src/services/ContractService.js';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('ContractService', () => {
  let service;

  beforeEach(() => {
    service = new ContractService();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('createContract', () => {
    it('should throw error if contract name is not provided', async () => {
      await expect(service.createContract('')).to.be.rejectedWith('contract name not provided');
    });

    it('should return existing contract if it already exists', async () => {
      const existingContract = { Name: 'ExistingContract' };
      const findOneStub = sinon.stub(Contract, 'findOne').resolves(existingContract);

      const result = await service.createContract('ExistingContract');
      expect(result).to.equal(existingContract);
      expect(findOneStub.calledOnceWith({ Name: 'ExistingContract' })).to.be.true;
    });

    it('should create and return new contract if not existing', async () => {
      const saveStub = sinon.stub().resolves({ Name: 'NewContract' });

      sinon.stub(Contract, 'findOne').resolves(null);
      const contractStub = sinon.stub(Contract.prototype, 'save').callsFake(saveStub);

      const result = await service.createContract('NewContract');
      expect(result.Name).to.equal('NewContract')
      expect(contractStub.calledOnce).to.be.true;
    });

    it('should throw error on database failure', async () => {
      sinon.stub(Contract, 'findOne').throws(new Error('DB error'));

      await expect(service.createContract('TestContract')).to.be.rejectedWith('Error creating contract: DB error');
    });
  });

  describe('findContract', () => {
    it('should return null if contract name is missing', async () => {
      const result = await service.findContract('');
      expect(result).to.be.null;
    });

    it('should return null if contract name is not a string', async () => {
      const result = await service.findContract(123);
      expect(result).to.be.null;
    });

    it('should return contract if found', async () => {
      const foundContract = { Name: 'TestContract' };
      const findOneStub = sinon.stub(Contract, 'findOne').resolves(foundContract);

      const result = await service.findContract('TestContract');
      expect(result).to.equal(foundContract);
      expect(findOneStub.calledOnceWith({ Name: 'TestContract' })).to.be.true;
    });

    it('should throw error on database failure', async () => {
      sinon.stub(Contract, 'findOne').throws(new Error('DB lookup failed'));

      await expect(service.findContract('SomeContract')).to.be.rejectedWith('Error finding contract: DB lookup failed');
    });
  });
});
