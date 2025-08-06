import mongoose from 'mongoose';

interface ISubject {
  name: string;
  code?: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const subjectSchema = new mongoose.Schema<ISubject>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Subject = mongoose.model<ISubject>('Subject', subjectSchema);