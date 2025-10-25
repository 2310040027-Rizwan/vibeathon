import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    eventName: { type: String }, // Keep for backwards compatibility
    date: { type: String, required: true }, // YYYY-MM-DD for simplicity
    time: { type: String }, // HH:mm
    venue: { type: String },
    description: { type: String },
    category: { type: String, enum: ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Other'], default: 'Other' },
    capacity: { type: Number },
    prerequisites: { type: String },
    coverImage: { type: String }, // base64 or URL
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

// Virtual to get name from either 'name' or 'eventName' field
eventSchema.virtual('displayName').get(function() {
  return this.name || this.eventName
})

export default mongoose.model('Event', eventSchema)
