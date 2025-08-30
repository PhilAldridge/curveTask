import * as chai from 'chai';
import sinon from 'sinon';
import chaiAsPromised from 'chai-as-promised';
import Track from '../src/models/Track.js';
import TrackService from '../src/services/trackService.js';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('TrackService', () => {
  let readerStub;
  let findContractStub;
  let service;

  beforeEach(() => {
    readerStub = { getData: sinon.stub() };
    findContractStub = sinon.stub();
    service = new TrackService(readerStub, findContractStub);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('validateTrackData', () => {
    it('should return error for missing Title and ISRC', () => {
      const result = service.validateTrackData({}, 5);
      expect(result.isValid).to.be.false;
      expect(result.errors).to.include('Row 5: Title is required');
      expect(result.errors).to.include('Row 5: ISRC is required');
    });

    it('should return isValid true if required fields exist', () => {
      const result = service.validateTrackData({ Title: 'Song', ISRC: 'ABC123' }, 1);
      expect(result.isValid).to.be.true;
      expect(result.errors).to.be.empty;
    });
  });

  describe('processRow', () => {
    it('should return error if validation fails', async () => {
      const result = await service.processRow({}, 'SomeContract', 3);
      expect(result.success).to.be.false;
      expect(result.errors).to.include('Row 3: Title is required');
      expect(result.errors).to.include('Row 3: ISRC is required');
    });

    it('should return error if contract not found', async () => {
      findContractStub.resolves(null);
      const track = { Title: 'Test', ISRC: 'XYZ' };
      const result = await service.processRow(track, 'UnknownContract', 2);
      expect(result.success).to.be.false;
      expect(result.errors[0]).to.equal("Row 2: Contract 'UnknownContract' not found");
    });

    it('should save and return success if valid', async () => {
      const mockContract = { _id: 'contract-id' };
      findContractStub.resolves(mockContract);

      const mockSavedTrack = { Title: 'Track A', ISRC: '123456', ContractId: 'contract-id' };
      sinon.stub(Track.prototype, 'save').resolves(mockSavedTrack);

      const track = { Title: 'Track A', ISRC: '123456' };
      const result = await service.processRow(track, 'SomeContract', 4);
      expect(result.success).to.be.true;
      expect(result.track).to.include({ Title: 'Track A', ISRC: '123456' });
    });

    it('should return error if save fails', async () => {
      findContractStub.resolves({ _id: 'abc' });
      sinon.stub(Track.prototype, 'save').throws(new Error('Save failed'));

      const track = { Title: 'Broken', ISRC: '000000' };
      const result = await service.processRow(track, 'SomeContract', 8);

      expect(result.success).to.be.false;
      expect(result.errors[0]).to.include('Row 8: Save failed');
    });
  });

  describe('ingestFromSpreadsheet', () => {
    it('should return error if spreadsheet has no data', async () => {
      readerStub.getData.returns([]);
      const result = await service.ingestFromSpreadsheet('file.xlsx', 'Sheet1', () => ({}));

      expect(result.errorCount).to.equal(0);
      expect(result.successCount).to.equal(0);
      expect(result.errors).to.include('No data found in spreadsheet');
    });

    it('should process all rows and count successes and errors', async () => {
      const rows = [
        { Title: 'Valid 1', ISRC: 'ISRC1', _rowNumber: 1 },
        { Title: '', ISRC: 'ISRC2', _rowNumber: 2 },
        { Title: 'Valid 2', ISRC: 'ISRC3', _rowNumber: 3 }
      ];
      readerStub.getData.returns(rows);

      const contract = { _id: 'contract123' };
      findContractStub.resolves(contract);

      // Simulate save only for valid rows
      sinon.stub(Track.prototype, 'save').resolves();

      const convertRowToTrack = (row) => ({
        track: { Title: row.Title, ISRC: row.ISRC },
        contract: 'ContractA'
      });

      const result = await service.ingestFromSpreadsheet('mock.xlsx', 'Sheet1', convertRowToTrack);

      expect(result.totalRows).to.equal(3);
      expect(result.successCount).to.equal(2);
      expect(result.errorCount).to.equal(1);
      expect(result.errors.some(e => e.includes('Title is required'))).to.be.true;
    });

    it('should catch and return general error', async () => {
      readerStub.getData.throws(new Error('Something went wrong'));

      const result = await service.ingestFromSpreadsheet('bad.xlsx', 'Sheet1', () => ({}));
      expect(result.errors[0]).to.include('General error: Something went wrong');
    });
  });
});
