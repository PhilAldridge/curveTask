import { expect } from 'chai';
import Track from '../src/models/Track.js';
import Contract from '../src/models/Contract.js';
import './setup.js'

describe('Models', function() {
  
  describe('Contract Model', function() {
    it('should create a contract with required fields', async function() {
      const contractData = {
        Name: 'Test Contract',
      };

      const contract = new Contract(contractData);
      const savedContract = await contract.save();

      expect(savedContract).to.have.property('_id');
      expect(savedContract.Name).to.equal('Test Contract');
    });

    it('should enforce unique contract names', async function() {
      const contractData = { Name: 'Unique Contract' };
      
      const contract1 = new Contract(contractData);
      await contract1.save();

      const contract2 = new Contract(contractData);
      
      try {
        await contract2.save();
        expect.fail('Should have thrown an error for duplicate contract name');
      } catch (error) {
        expect(error.code).to.equal(11000); // MongoDB duplicate key error
      }
    });

    it('should require contract name', async function() {
      const contract = new Contract({});
      
      try {
        await contract.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.Name).to.exist;
      }
    });
  });

  describe('Track Model', function() {
    let contract;

    beforeEach(async function() {
      contract = new Contract({
        Name: 'Test Contract'
      });
      await contract.save();
    });

    it('should create a track with required fields', async function() {
      const trackData = {
        Title: 'Test Song',
        Artist: 'Test Artist',
        ISRC: 'Test ISRC',
        Aliases: ['Song Alias 1', 'Song Alias 2'],
        ContractId: contract._id
      };
      const track = new Track(trackData);
      const savedTrack = await track.save();

      expect(savedTrack).to.have.property('_id');
      expect(savedTrack.Title).to.equal('Test Song');
      expect(savedTrack.Artist).to.equal('Test Artist');
      expect(savedTrack.ISRC).to.equal('Test ISRC');
      expect(savedTrack.Aliases).to.be.an('array').with.length(2);
      expect(savedTrack.ContractId.toString()).to.equal(contract._id.toString());
    });

    it('should require title and ISRC', async function() {
      const track = new Track({});
      
      try {
        await track.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.Title).to.exist;
        expect(error.errors.ISRC).to.exist;
      }
    });

    it('should save track without contract reference', async function() {
      const trackData = {
        Title: 'Independent Song',
        ISRC: 'Test ISRC'
      };

      const track = new Track(trackData);
      const savedTrack = await track.save();

      expect(savedTrack.Title).to.equal('Independent Song');
      expect(savedTrack.ISRC).to.equal('Test ISRC');
      expect(savedTrack.contractId).to.be.undefined;
    });

    it('should populate contract reference', async function() {
      const track = new Track({
        Title: 'Test Song',
        ISRC: 'Test ISRC',
        ContractId: contract._id
      });
      
      await track.save();
      
      const populatedTrack = await Track.findById(track._id).populate('ContractId');
      
      expect(populatedTrack.ContractId).to.exist;
      expect(populatedTrack.ContractId.Name).to.equal('Test Contract');
    });
  });
});