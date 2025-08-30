const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
});

// Index for faster lookups by name
contractSchema.index({ Name: 1 });

module.exports = mongoose.model('Contract', contractSchema);