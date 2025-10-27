import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  text: string;
  readBy: mongoose.Types.ObjectId[];
}

const MessageSchema = new Schema<IMessage>({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

MessageSchema.index({ conversationId: 1, createdAt: 1 });

export default mongoose.model<IMessage>('Message', MessageSchema);


