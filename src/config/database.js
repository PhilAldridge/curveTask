const mongoose = require('mongoose');

class Database {
  constructor() {
    this.connection = null;
  }

  async connect(uri = process.env.MONGODB_URI) {
    try {
      if (this.connection) {
        return this.connection;
      }

      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      };

      this.connection = await mongoose.connect(uri, options);
      console.log(`MongoDB connected: ${this.connection.connection.host}`);
      return this.connection;
    } catch (error) {
      console.error('Database connection failed:', error.message);
      process.exit(1);
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        this.connection = null;
        console.log('MongoDB disconnected');
      }
    } catch (error) {
      console.error('Error disconnecting from database:', error.message);
    }
  }

  async clearDatabase() {
    try {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
      }
      console.log('Database cleared');
    } catch (error) {
      console.error('Error clearing database:', error.message);
    }
  }
}

module.exports = new Database();