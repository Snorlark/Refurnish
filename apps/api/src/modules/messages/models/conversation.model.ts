import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  members: mongoose.Types.ObjectId[];
  lastMessage?: mongoose.Types.ObjectId;
}

const ConversationSchema = new Schema<IConversation>({
  members: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
}, { timestamps: true });

ConversationSchema.index({ members: 1 });

export default mongoose.model<IConversation>('Conversation', ConversationSchema);


