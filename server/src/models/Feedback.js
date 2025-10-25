import mongoose from 'mongoose'

const feedbackSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

export default mongoose.model('Feedback', feedbackSchema)
