"use client";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { MessagesSkeleton, ChatMessagesSkeleton } from './SkeletonLoader';
import { X, Send, MessageCircle, LogIn, Plus, RefreshCw } from 'lucide-react';
import io from 'socket.io-client';

interface ChatBubbleProps {
  className?: string;
  sellerId?: string;
  sellerName?: string;
  openWithUser?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://refurnish-backend.onrender.com';

export default function ChatBubble({ className = "", sellerId, sellerName = "Seller", openWithUser }: ChatBubbleProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  const [convos, setConvos] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [showComposer, setShowComposer] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [lookupUsers, setLookupUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [sentMessageIds, setSentMessageIds] = useState<Set<string>>(new Set());
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState<Map<string, number>>(new Map());
  const [activeUsers, setActiveUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { token, user } = useAuth();
  const router = useRouter();

  // Socket connection
  useEffect(() => {
    if (!token || !user) return;
    
    const s = io(API_BASE_URL, { 
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      timeout: 20000,
      forceNew: true
    });
    
    s.on('connect', () => {
      console.log('ChatBubble Socket connected:', s.id);
      setSocket(s);
      
      // Test socket connection
      s.emit('test_connection', { userId: user?.id });
    });
    
    s.on('disconnect', () => {
      console.log('ChatBubble Socket disconnected');
    });
    
    s.on('connect_error', (error: any) => {
      console.error('ChatBubble Socket connection error:', error);
    });
    
    // Listen for any message event (not just receive_message)
    s.on('message', (data: any) => {
      console.log('ChatBubble received message event:', data);
    });
    
    s.on('new_message', (data: any) => {
      console.log('ChatBubble received new_message event:', data);
    });
    
    return () => {
      s.disconnect();
    };
  }, [token, user]);

  // Load conversations and unread count (always, not just when chat is open)
  useEffect(() => {
    if (!token) return;
    
    setIsLoadingConversations(true);
    fetch(`${API_BASE_URL}/api/chat/conversations`, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    }).then(r => r.json()).then((conversations) => {
      setConvos(conversations);
      setIsLoadingConversations(false);
      
      // Initialize unread messages map - start with 0 for all conversations
      const unreadMap = new Map<string, number>();
      conversations.forEach((conv: any) => {
        unreadMap.set(conv._id, 0);
      });
      setUnreadMessages(unreadMap);
      
      // Calculate total unread count
      const totalUnread = Array.from(unreadMap.values()).reduce((sum, count) => sum + count, 0);
      setUnreadCount(totalUnread);
    }).catch(() => {
      setIsLoadingConversations(false);
    });
  }, [token]);

  // Load conversations for chat display (only when chat is open)
  useEffect(() => {
    if (!token || !isChatOpen) return;
    
    // Conversations are already loaded above, just set loading to false
    setIsLoadingConversations(false);
  }, [token, isChatOpen]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (!activeId || !token) return;
    
    setIsLoadingMessages(true);
    fetch(`${API_BASE_URL}/api/chat/conversations/${activeId}/messages`, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    }).then(r => r.json()).then((data) => {
      setMessages(data);
      setIsLoadingMessages(false);
      
      // Mark this conversation as read when opened
      setUnreadMessages(prev => {
        const newMap = new Map(prev);
        newMap.set(activeId, 0);
        return newMap;
      });
    }).catch(() => {
      setIsLoadingMessages(false);
    });
  }, [activeId, token]);

  // Socket message handling
  useEffect(() => {
    if (!socket) return;
    
    const handler = (data: any) => {
      const conversationId = data.conversationId || data.chatId;
      const isFromCurrentUser = data.sender === user?.id;
      
      console.log('ChatBubble received message:', { conversationId, activeId, isFromCurrentUser, data });
      
      // Always add the message to the active conversation if it matches
      if (conversationId === activeId) {
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some(msg => msg._id === data._id);
          if (exists) return prev;
          console.log('Adding message to active conversation:', data);
          return [...prev, data];
        });
      }
      
      // Update conversations list to show latest message
      setConvos(prev => {
        return prev.map(conv => {
          if (conv._id === conversationId) {
            return {
              ...conv,
              lastMessage: {
                text: data.text,
                sender: data.sender,
                createdAt: data.createdAt
              }
            };
          }
          return conv;
        });
      });
      
      // Only count as unread if:
      // 1. It's NOT from the current user
      // 2. It's NOT in the currently active conversation
      if (!isFromCurrentUser && conversationId !== activeId) {
        setUnreadMessages(prev => {
          const newMap = new Map(prev);
          const currentCount = newMap.get(conversationId) || 0;
          newMap.set(conversationId, currentCount + 1);
          return newMap;
        });
      } else if (isFromCurrentUser && conversationId === activeId) {
        // If it's from current user in active conversation, ensure unread count is 0
        setUnreadMessages(prev => {
          const newMap = new Map(prev);
          newMap.set(conversationId, 0);
          return newMap;
        });
      }
    };
    
    socket.on('receive_message', handler);
    return () => socket.off('receive_message', handler);
  }, [socket, activeId, user?.id]);

  // Fallback: Refresh messages periodically for active conversation
  useEffect(() => {
    if (!activeId || !token) return;
    
    const refreshMessages = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/chat/conversations/${activeId}/messages`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const newMessages = await res.json();
          setMessages(prev => {
            // Only update if we got new messages (different length)
            if (newMessages.length !== prev.length) {
              console.log('ChatBubble fallback: Got new messages', newMessages.length, 'vs', prev.length);
              return newMessages;
            }
            return prev;
          });
        }
      } catch (e) {
        console.error('Failed to refresh messages:', e);
      }
    };
    
    // Refresh every 5 seconds as fallback
    const interval = setInterval(refreshMessages, 5000);
    
    return () => clearInterval(interval);
  }, [activeId, token]);

  // Update total unread count when unread messages change
  useEffect(() => {
    const totalUnread = Array.from(unreadMessages.values()).reduce((sum, count) => sum + count, 0);
    setUnreadCount(totalUnread);
  }, [unreadMessages]);

  // Fetch active users periodically (like messages page)
  useEffect(() => {
    if (!token) return;
    
    const fetchActiveUsers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/active`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const users = await res.json();
          const activeUserIds = new Set<string>(users.map((u: any) => u._id || u.id).filter(Boolean));
          setActiveUsers(activeUserIds);
        }
      } catch (e) {
        console.error('Failed to fetch active users:', e);
      }
    };

    // Update current user activity
    const updateActivity = async () => {
      try {
        await fetch(`${API_BASE_URL}/api/users/activity`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        console.error('Failed to update activity:', e);
      }
    };

    // Fetch immediately
    fetchActiveUsers();
    updateActivity();
    
    // Then every 30 seconds
    const interval = setInterval(() => {
      fetchActiveUsers();
      updateActivity();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [token]);

  // Periodically refresh conversations (every 60 seconds) - but don't reset unread count
  useEffect(() => {
    if (!token) return;
    
    const interval = setInterval(() => {
      fetch(`${API_BASE_URL}/api/chat/conversations`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      }).then(r => r.json()).then((conversations) => {
        // Update conversations but preserve unread count
        setConvos(conversations);
      }).catch(() => {
        // Silently fail on refresh
      });
    }, 60000); // 60 seconds
    
    return () => clearInterval(interval);
  }, [token]);

  // Auto-scroll
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [messages]);

  // Handle opening chat with specific user
  useEffect(() => {
    if (openWithUser && user && convos.length > 0) {
      // Find existing conversation with this user
      const existingConvo = convos.find(conv => {
        const participants = conv.participants || conv.users || conv.members || [];
        return participants.some((p: any) => (p._id || p.id) === openWithUser.id);
      });

      if (existingConvo) {
        // Open existing conversation
        setActiveId(existingConvo._id);
        setIsChatOpen(true);
      } else {
        // Start new conversation
        setSelectedUser(openWithUser);
        setShowComposer(true);
        setIsChatOpen(true);
      }
    }
  }, [openWithUser, user, convos]);

  const sendMessage = async () => {
    if (!text.trim() || !activeId || !token) return;
    
    try {
      setError('');
      const res = await fetch(`${API_BASE_URL}/api/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ conversationId: activeId, text: text.trim() }),
      });
      
      if (res.ok) {
        const messageData = await res.json();
        console.log('ChatBubble message sent successfully:', messageData);
        
        // Add message immediately to UI
        setMessages(prev => {
          const exists = prev.some(msg => msg._id === messageData._id);
          if (exists) return prev;
          console.log('Adding sent message to UI:', messageData);
          return [...prev, messageData];
        });
        
        setSentMessageIds(prev => new Set([...prev, messageData._id]));
        setText('');
        
        // Ensure this conversation stays at 0 unread (since you're the one sending)
        setUnreadMessages(prev => {
          const newMap = new Map(prev);
          newMap.set(activeId, 0);
          return newMap;
        });
        
        // Emit to socket
        if (socket && socket.connected) {
          console.log('ChatBubble emitting message to socket:', {
            chatId: activeId,
            conversationId: activeId,
            text: messageData.text,
            sender: messageData.sender,
            _id: messageData._id,
            createdAt: messageData.createdAt,
            isFromSender: true
          });
          socket.emit('send_message', {
            chatId: activeId,
            conversationId: activeId,
            text: messageData.text,
            sender: messageData.sender,
            _id: messageData._id,
            createdAt: messageData.createdAt,
            isFromSender: true
          });
        } else {
          console.log('ChatBubble socket not available or not connected:', { socket: !!socket, connected: socket?.connected });
        }
        
        // Fallback: Check for new messages after a short delay
        setTimeout(() => {
          refreshMessages();
        }, 1000);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const startNewConversation = async (overrideUser?: any) => {
    try {
      setError('');
      const target = overrideUser || selectedUser;
      if (!target) return;
      
      const res = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ recipientId: target.id }),
      });
      
      if (res.ok) {
        const convo = await res.json();
        setConvos(prev => [convo, ...prev]);
        setActiveId(convo._id);
        setShowComposer(false);
        setRecipientEmail('');
        setLookupUsers([]);
        setSelectedUser(null);
        
        // Initialize this new conversation with 0 unread messages
        setUnreadMessages(prev => {
          const newMap = new Map(prev);
          newMap.set(convo._id, 0);
          return newMap;
        });
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to start conversation');
      }
    } catch (err) {
      console.error('Error starting conversation:', err);
      setError('Failed to start conversation');
    }
  };

  // User lookup
  useEffect(() => {
    if (!token || !recipientEmail.trim()) {
      setLookupUsers([]);
      setSelectedUser(null);
      return;
    }
    
    const timeout = setTimeout(async () => {
      try {
        const resp = await fetch(`${API_BASE_URL}/api/users/lookup?email=${encodeURIComponent(recipientEmail)}`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        
        if (resp.ok) {
          const data = await resp.json();
          setLookupUsers(Array.isArray(data) ? data : [data]);
          setSelectedUser(null);
        }
      } catch (err) {
        setLookupUsers([]);
        setSelectedUser(null);
      }
    }, 350);
    
    return () => clearTimeout(timeout);
  }, [recipientEmail, token]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const refreshMessages = async () => {
    if (!activeId || !token) return;
    
    try {
      console.log('ChatBubble manually refreshing messages...');
      const res = await fetch(`${API_BASE_URL}/api/chat/conversations/${activeId}/messages`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const newMessages = await res.json();
        console.log('ChatBubble refreshed messages:', newMessages.length);
        setMessages(newMessages);
      }
    } catch (e) {
      console.error('Failed to refresh messages:', e);
    }
  };

  const handleChatClick = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setIsChatOpen(!isChatOpen);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const isNewDay = (current: string, previous: string | null) => {
    if (!previous) return true;
    const currentDate = new Date(current).toDateString();
    const previousDate = new Date(previous).toDateString();
    return currentDate !== previousDate;
  };

  return (
    <div className={`fixed bottom-4 md:bottom-6 right-4 md:right-6 z-50 ${className}`}>
      {/* Chat Bubble Button */}
      <button 
        onClick={handleChatClick}
        className="w-12 h-12 md:w-14 md:h-14 bg-green-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-green-700 transition-all duration-300 hover:scale-110 group relative"
      >
        <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
       
        {user && unreadCount > 0 && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </button>
      
      {/* Chat Window - Minimal version of messages page with proper layout */}
      {isChatOpen && (
        <div className="absolute bottom-14 md:bottom-16 right-0 w-96 md:w-[500px] h-80 md:h-[450px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 h-full">
            {/* Conversations list - Left side */}
            <div className={`border-r p-2 overflow-y-auto ${activeId ? 'hidden md:block' : 'block'}`}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-900">Messages</h2>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => setShowComposer(!showComposer)}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                    title="New conversation"
                  >
                    <Plus className="w-3 h-3 text-gray-600" />
                  </button>
            <button 
              onClick={() => setIsChatOpen(false)}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-gray-600" />
                  </button>
                </div>
              </div>
              
              {/* New Conversation Composer */}
              {showComposer && (
                <div className="mb-2 p-2 border border-gray-200 rounded-lg bg-gray-50 space-y-2 relative">
                  <input
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="Recipient email"
                    className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                  {lookupUsers.length > 0 && (
                    <div className="absolute left-0 right-0 top-[60px] z-10 bg-white border border-gray-200 rounded shadow max-h-32 overflow-y-auto">
                      {lookupUsers.map((user) => (
                        <div 
                          key={user.id} 
                          onClick={() => { setSelectedUser(user); setLookupUsers([]); startNewConversation(user); }}
                          className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="text-xs font-medium">{user.firstName} {user.lastName}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-1 justify-end">
                    <button 
                      onClick={() => {setShowComposer(false); setRecipientEmail(''); setLookupUsers([]); setSelectedUser(null);}} 
                      className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-700"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={startNewConversation} 
                      disabled={!selectedUser} 
                      className={`px-2 py-1 text-xs rounded ${selectedUser ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                    >
                      Start
            </button>
          </div>
                </div>
              )}
              
              {/* Conversations */}
              <div className="space-y-1">
                {isLoadingConversations ? (
                  <MessagesSkeleton />
                ) : (
                  convos.map((c) => {
                    const participants = c.participants || c.users || c.members || [];
                    const meId = user?.id;
                    const other = participants.find((p: any) => (p?._id || p?.id) !== meId) || {};
                    const displayName = [other.firstName, other.lastName].filter(Boolean).join(' ') || other.email || 'Conversation';
                    
                    return (
                      <button 
                        key={c._id} 
                        onClick={() => setActiveId(c._id)} 
                        className={`w-full text-left p-2 rounded-lg text-xs ${
                          activeId === c._id ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs text-gray-600">
                              {(displayName || 'U')[0]}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-gray-900 truncate">{displayName}</div>
                            <div className="text-xs text-gray-500 truncate">{other.email}</div>
                          </div>
                          {(unreadMessages.get(c._id) || 0) > 0 && (
                            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-bold">
                                {(unreadMessages.get(c._id) || 0) > 9 ? '9+' : unreadMessages.get(c._id)}
                              </span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
                {convos.length === 0 && !isLoadingConversations && (
                  <div className="text-xs text-gray-500 text-center py-2">No conversations yet</div>
                )}
              </div>
            </div>

            {/* Chat area - Right side */}
            <div className={`${activeId ? 'block' : 'hidden md:block'} col-span-2 relative`} style={{ height: '100%' }}>
              {/* Mobile back to conversations */}
              <div className="md:hidden sticky top-0 left-0 right-0 z-10 bg-white border-b px-2 py-1 flex items-center gap-2">
                <button
                  onClick={() => setActiveId(null)}
                  className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-700"
                >
                  Back
                </button>
                <div className="text-xs text-gray-900 font-medium">Conversation</div>
              </div>
              
              {/* Chat Header - Profile info like Reddit */}
              {activeId && (
                <div className="sticky top-0 left-0 right-0 z-10 bg-white border-b px-3 py-2 flex items-center justify-between">
                  {(() => {
                    const participants = convos.find(c => c._id === activeId)?.participants || [];
                    const meId = user?.id;
                    const other = participants.find((p: any) => (p?._id || p?.id) !== meId) || {};
                    const displayName = [other.firstName, other.lastName].filter(Boolean).join(' ') || other.email || 'User';
                    const userEmail = other.email || '';
                    const otherUserId = other._id || other.id;
                    const isActive = activeUsers.has(otherUserId);
                    const showAsActive = isActive;
                    
                    return (
                      <>
                        <div 
                          className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors group"
                          onClick={() => router.push(`/user-profile/${userEmail}`)}
                          title="View Profile"
                        >
                          <div className="relative">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              {other.profilePicture ? (
                                <img
                                  src={other.profilePicture}
                                  alt={displayName}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <span className="text-sm font-bold text-gray-600">
                                  {displayName.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            {showAsActive && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors">{displayName}</div>
                            <div className="text-xs text-gray-500">
                              {showAsActive ? 'Active now' : 'Last seen recently'}
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              // Close chat bubble and redirect to messages page with conversation ID
                              setIsChatOpen(false);
                              if (activeId) {
                                router.push(`/profile/messages?conversation=${activeId}`);
                              } else {
                                router.push('/profile/messages');
                              }
                            }}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            title="View in Messages"
                          >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </button>
                          <button
                            onClick={refreshMessages}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            title="Refresh messages"
                          >
                            <RefreshCw className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => setIsChatOpen(false)}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            title="Close"
                          >
                            <X className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
              
              {/* Messages area - scrollable */}
              <div 
                className="absolute left-0 right-0 bg-gray-50"
                style={{ 
                  top: activeId ? '60px' : '0px',
                  height: activeId ? 'calc(100% - 120px)' : 'calc(100% - 60px)', 
                  overflowY: 'auto',
                  padding: '8px'
                }}
              >
                <div className="space-y-2">
                  {activeId ? (
                    isLoadingMessages ? (
                      <ChatMessagesSkeleton />
                    ) : messages.length > 0 ? (
                      <>
                        {messages.map((message, idx) => {
                          const isMine = message.sender === user?.id;
                          const created = new Date(message.createdAt || message.timestamp || Date.now());
                          const prev = messages[idx - 1];
                          const prevCreated = prev ? new Date(prev.createdAt || prev.timestamp || Date.now()) : null;
                          const isNewDay = !prev || created.toDateString() !== prevCreated?.toDateString();
                          
                          return (
                            <div key={message._id || idx} className="space-y-1">
                              {isNewDay && (
                                <div className="flex items-center gap-3 my-2">
                                  <div className="flex-1 border-t border-gray-200"/>
                                  <div className="text-xs text-gray-500">{formatDate(created.toISOString())}</div>
                                  <div className="flex-1 border-t border-gray-200"/>
                                </div>
                              )}
                              <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                <div className={`px-3 py-2 rounded-2xl max-w-[85%] text-sm ${
                                  isMine 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-white border border-gray-200 text-gray-800'
                                }`}>
                                  <div className="break-words">{message.text}</div>
                                  <div className={`mt-1 text-[10px] ${
                                    isMine ? 'text-green-100' : 'text-gray-500'
                                  }`}>
                                    {formatTime(created.toISOString())}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </>
                    ) : (
                      <div className="text-xs text-gray-500 text-center py-4">No messages yet</div>
                    )
                  ) : (
                    <div className="text-xs text-gray-500 text-center py-4">Select a conversation to start</div>
                  )}
            </div>
          </div>
          
              {/* Input area - fixed at bottom */}
              {activeId && (
                <div 
                  className="absolute bottom-0 left-0 right-0 border-t p-2 flex items-center gap-2 bg-white" 
                  style={{ height: '60px' }}
                >
              <input 
                    value={text} 
                    onChange={(e) => setText(e.target.value)} 
                    onKeyPress={handleKeyPress} 
                placeholder="Type a message..."
                    className="flex-1 px-3 py-2 bg-gray-100 rounded-full text-xs text-gray-800 border border-gray-200 outline-none" 
                    disabled={isLoadingMessages}
                  />
                  <button 
                    onClick={sendMessage} 
                    disabled={!text.trim() || isLoadingMessages}
                    className="px-3 py-2 rounded-full bg-green-600 text-white text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
              </button>
                </div>
              )}
              {error && (
                <div className="p-2 text-xs text-red-600">{error}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}