import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  userId: mongoose.Types.ObjectId;
  postedBy: string;
  description: string;
  like: number;
  comment: number;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    postedBy: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    like: {
      type: Number,
      default: 0,
    },
    comment: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPost>('Post', postSchema);
