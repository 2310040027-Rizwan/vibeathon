import mongoose from 'mongoose'

const eventRequestSchema = new mongoose.Schema(
  {
    eventName: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String },
    venue: { type: String },
    description: { type: String },
    category: { type: String, enum: ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Other'], default: 'Other' },
    capacity: { type: Number },
    prerequisites: { type: String },
    coverImage: { type: String }, // base64 or URL
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending',
      index: true 
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    reviewNotes: { type: String },
    // When approved, this stores the created event ID
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  },
  { timestamps: true }
)

export default mongoose.model('EventRequest', eventRequestSchema)
