import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  title: string;
  description: string;
  category: 'Bug' | 'Feature Request' | 'Improvement' | 'Other';
  status: 'New' | 'In Review' | 'Resolved';
  submitterName?: string;
  submitterEmail?: string;
  ai_category?: string;
  ai_sentiment?: string;
  ai_priority?: number;
  ai_summary?: string;
  ai_tags?: string[];
  ai_processed: boolean;
}

const FeedbackSchema: Schema = new Schema({
  title: { type: String, required: true, maxlength: 120 },
  description: { type: String, required: true, minlength: 20 },
  category: { type: String, enum: ['Bug', 'Feature Request', 'Improvement', 'Other'], required: true },
  status: { type: String, enum: ['New', 'In Review', 'Resolved'], default: 'New' },
  submitterName: { type: String },
  submitterEmail: { type: String },
  ai_category: { type: String },
  ai_sentiment: { type: String },
  ai_priority: { type: Number },
  ai_summary: { type: String },
  ai_tags: { type: [String] },
  ai_processed: { type: Boolean, default: false }
}, { timestamps: true });

// Adding indexes for performance [cite: 115]
FeedbackSchema.index({ status: 1, category: 1, ai_priority: -1, createdAt: -1 });

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);