import mongoose from "mongoose";

const trackSchema = new mongoose.Schema({
  Title: {
    type: String,
    required: true,
    trim: true
  },
  Version: {
    type: String,
    required: false,
    trim: true
  },
  Artist: {
    type: String,
    required: false,
    trim: true
  },
  ISRC: {
    type: String,
    required: true,
    trim: true
  },
  PLine: {
    type: String,
    required:false,
    trim: true
  },
  Aliases: [{
    type: [String],
    required: false,
    trim: true
  }],
  ContractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract'
  }
});

// Indexes for better query performance
trackSchema.index({ Title: 1, Artist: 1 });
trackSchema.index({ ContractId: 1 });

export default mongoose.model('Track', trackSchema);