const mongoose = require('mongoose');

const IDENodeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References your existing User model
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  path: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['file', 'folder'],
    required: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IDENode',
    default: null,
  },
  content: {
    type: String,
    default: '', // Only populated if type is 'file'
  },
  language: {
    type: String,
    default: 'plaintext', // Monaco language identifier (js, python, json etc.)
  }
}, { timestamps: true });

// CRITICAL INDEXES
// Ensures path uniqueness per user (User A and User B can both have an '/src/app.js')
// here 1 means ascending order and -1 means decending order
IDENodeSchema.index({ userId: 1, path: 1 }, { unique: true });
IDENodeSchema.index({ userId: 1, parentId: 1 });

const IDENode = mongoose.model('IDENode', IDENodeSchema);

module.exports = IDENode;


// NOTE : critical warning , using indexes on large production database might causes issues
// as by default mongoose automatically triggers creaateIndex() for every decleared index, when your application boots up.