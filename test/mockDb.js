import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

class MockDatabase {
  constructor() {
    this.mongoServer = null;
    this.connection = null;
  }

  async connect() {
    try {
      // Create in-memory MongoDB instance
      this.mongoServer = await MongoMemoryServer.create({
        instance: {
          port: 0, // Random port
          dbName: 'test_db'
        }
      });

      const uri = this.mongoServer.getUri();
      
      // Connect mongoose to the in-memory database
      this.connection = await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      console.log('Connected to in-memory MongoDB');
      return this.connection;
    } catch (error) {
      console.error('Mock database connection failed:', error.message);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        this.connection = null;
      }
      
      if (this.mongoServer) {
        await this.mongoServer.stop();
        this.mongoServer = null;
      }
      
      console.log('Disconnected from mock database');
    } catch (error) {
      console.error('Error disconnecting from mock database:', error.message);
      throw error;
    }
  }

  async clearDatabase() {
    try {
      if (!this.connection) {
        return;
      }

      const collections = mongoose.connection.collections;
      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
      }
    } catch (error) {
      console.error('Error clearing mock database:', error.message);
      throw error;
    }
  }

  async dropDatabase() {
    try {
      if (this.connection) {
        await mongoose.connection.dropDatabase();
      }
    } catch (error) {
      console.error('Error dropping mock database:', error.message);
      throw error;
    }
  }

  getConnectionString() {
    return this.mongoServer ? this.mongoServer.getUri() : null;
  }

  isConnected() {
    return mongoose.connection.readyState === 1;
  }
}

export default new MockDatabase();