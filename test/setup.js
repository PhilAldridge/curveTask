import dotenv from 'dotenv';
import database from './mockDb.js';

dotenv.config();

// Setup hooks for tests
before(async function() {
  this.timeout(10000);
  console.log('Setting up test database...');
  await database.connect();
});

after(async function() {
  this.timeout(10000);
  console.log('Cleaning up test database...');
  await database.clearDatabase();
  await database.disconnect();
});

beforeEach(async function() {
  // Clear database before each test
  await database.clearDatabase();
});

export default {
  database
};