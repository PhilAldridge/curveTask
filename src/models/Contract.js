import mongoose from "mongoose";

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

export default mongoose.model('Contract', contractSchema);