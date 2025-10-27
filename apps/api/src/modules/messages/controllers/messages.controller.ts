import { Request, Response } from 'express';
import Conversation from '../models/conversation.model';
import Message from '../models/message.model';
import User from '../../users/models/user.model';

export const listConversations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const convos = await Conversation.find({ members: userId })
      .populate('members', 'firstName lastName email profilePicture role')
      .sort({ updatedAt: -1 })
      .lean();
    
    // Transform to include participants array with user details
    const conversationsWithParticipants = convos.map(convo => ({
      ...convo,
      participants: convo.members,
      users: convo.members // For backward compatibility
    }));
    
    res.status(200).json(conversationsWithParticipants);
  } catch (e) {
    res.status(500).json({ error: 'Failed to list conversations' });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const msgs = await Message.find({ conversationId: id }).sort({ createdAt: 1 }).lean();
    res.status(200).json(msgs);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { conversationId, text, recipientId } = req.body as { conversationId?: string; text: string; recipientId?: string };

    let convoId = conversationId;
    if (!convoId) {
      if (!recipientId) return res.status(400).json({ error: 'recipientId required when no conversationId' });
      // Ensure a conversation exists (two-member convo for now)
      let convo = await Conversation.findOne({ members: { $all: [userId, recipientId] } });
      if (!convo) {
        convo = await Conversation.create({ members: [userId, recipientId] });
      }
      convoId = convo._id.toString();
    }

    const msg = await Message.create({ conversationId: convoId, sender: userId, text, readBy: [userId] });
    await Conversation.findByIdAndUpdate(convoId, { lastMessage: msg._id }, { new: true });
    res.status(201).json(msg);
  } catch (e) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const createConversation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { recipientId } = req.body as { recipientId: string };
    if (!recipientId) return res.status(400).json({ error: 'recipientId is required' });
    let convo = await Conversation.findOne({ members: { $all: [userId, recipientId] } });
    if (!convo) {
      convo = await Conversation.create({ members: [userId, recipientId] });
    }
    
    // Populate user details
    const populatedConvo = await Conversation.findById(convo._id)
      .populate('members', 'firstName lastName email profilePicture role')
      .lean();
    
    // Transform to include participants array
    const conversationWithParticipants = {
      ...populatedConvo,
      participants: populatedConvo?.members,
      users: populatedConvo?.members
    };
    
    return res.status(201).json(conversationWithParticipants);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to create conversation' });
  }
};


