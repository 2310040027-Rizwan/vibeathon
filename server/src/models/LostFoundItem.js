import mongoose from 'mongoose'

const lostFoundSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true },
    description: { type: String },
    location: { type: String },
    // Optional GeoJSON point for map coordinates (lng, lat)
    geo: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: [Number],
    },
    status: { type: String, enum: ['lost', 'found', 'claimed'], default: 'lost', index: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Optional explicit timestamp when item was lost/found if reporter knows it
    lostAt: { type: Date },
    // Optional image data (base64) or image URL
    imageData: { type: String },
    // Claim information
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    claimedAt: { type: Date },
    claimImage: { type: String }, // Image proof when claiming
    claimNotes: { type: String }, // Additional notes when claiming
  },
  { timestamps: true }
)

// Geospatial index for geo lookups
lostFoundSchema.index({ geo: '2dsphere' })

export default mongoose.model('LostFoundItem', lostFoundSchema)
