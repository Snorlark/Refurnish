"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { MessagesSkeleton, ChatMessagesSkeleton } from '../../../components/SkeletonLoader';
import { useSearchParams } from 'next/navigation';
import io from 'socket.io-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://refurnish-backend.onrender.com';

export default function ProfileMessagesPage() {
  const { token, user } = useAuth();
  const searchParams = useSearchParams();
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
  const [readConversations, setReadConversations] = useState<Set<string>>(new Set());
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [sentMessageIds, setSentMessageIds] = useState<Set<string>>(new Set());
  const [unreadMessages, setUnreadMessages] = useState<Map<string, number>>(new Map());
  const [activeUsers, setActiveUsers] = useState<Set<string>>(new Set());
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    if (!token) return;
    setIsLoadingConversations(true);
    fetch(`${API_BASE_URL}/api/chat/conversations`, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    }).then(r => r.json()).then((conversations) => {
      setConvos(conversations);
      
      // Initialize unread messages based on last message timestamps
      // This is a simple approach - in a real app you'd track read status in the database
      const unreadMap = new Map<string, number>();
      conversations.forEach((conv: any) => {
        // For now, we'll assume all conversations are "read" on page load
        // In a real implementation, you'd check against a "lastReadMessageId" or timestamp
        unreadMap.set(conv._id, 0);
      });
      setUnreadMessages(unreadMap);
      setIsLoadingConversations(false);
    }).catch(()=>{
      setIsLoadingConversations(false);
    });
  }, [token]);

  // Handle conversation parameter from URL
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    console.log('URL conversation parameter:', conversationId);
    console.log('Available conversations:', convos.map(c => c._id));
    
    if (conversationId && convos.length > 0) {
      // Check if the conversation exists in the loaded conversations
      const conversationExists = convos.some(conv => conv._id === conversationId);
      console.log('Conversation exists:', conversationExists);
      
      if (conversationExists) {
        console.log('Setting active conversation to:', conversationId);
        setActiveId(conversationId);
      }
    }
  }, [searchParams, convos]);

  // Fetch active users periodically
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

  useEffect(() => {
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
      console.log('Socket connected:', s.id, 'connected:', s.connected);
    });
    
    s.on('disconnect', (reason: any) => {
      console.log('Socket disconnected:', reason, 'connected:', s.connected);
    });
    
    s.on('connect_error', (err: any) => {
      console.error('Socket connection error:', err);
    });
    
    s.on('reconnect', (attemptNumber: any) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts', 'connected:', s.connected);
    });
    
    s.on('reconnect_error', (err: any) => {
      console.error('Socket reconnection error:', err);
    });
    
    s.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
    });
    
    setSocket(s);
    return () => { 
      console.log('Disconnecting socket');
      s.disconnect(); 
    };
  }, []);

  useEffect(() => {
    if (!socket || !activeId) return;
    
    console.log('Joining chat:', activeId);
    socket.emit('join_chat', activeId);
    
    // Clear sent message IDs when switching conversations
      setSentMessageIds(new Set());
      
      setIsLoadingMessages(true);
      fetch(`${API_BASE_URL}/api/chat/conversations/${activeId}/messages`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      }).then(r => r.json()).then((data) => {
        setMessages(data);
        setIsLoadingMessages(false);
      }).catch(()=>{
        setIsLoadingMessages(false);
      });

    // Mark conversation as read when viewing it
    setReadConversations(prev => new Set([...prev, activeId]));
    
    // Clear unread messages for this conversation
    setUnreadMessages(prev => {
      const newMap = new Map(prev);
      newMap.delete(activeId);
      return newMap;
    });

    const handler = (msg: any) => {
      console.log('Received message:', msg, 'for conversation:', activeId);
      const conversationId = msg.chatId || msg.conversationId;
      
      // Only add message if it belongs to the current conversation and not already exists
      // Don't add if it's from the current sender (to prevent doubling)
      if (conversationId === activeId && 
          !messages.some(m => m._id === msg._id || m.id === msg.id) &&
          !sentMessageIds.has(msg._id) &&
          !msg.isFromSender) {
        console.log('Adding message to conversation');
        setMessages(prev => {
          // Double check to prevent duplicates
          const exists = prev.some(m => m._id === msg._id || m.id === msg.id);
          if (exists) {
            console.log('Message already exists in state, not adding');
            return prev;
          }
          return [...prev, msg];
        });
        // Scroll to bottom when new message arrives
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 50);
      } else if (conversationId && conversationId !== activeId) {
        // Message is for a different conversation - mark as unread
        console.log('Message for different conversation, marking as unread:', conversationId);
        setUnreadMessages(prev => {
          const newMap = new Map(prev);
          const currentCount = newMap.get(conversationId) || 0;
          newMap.set(conversationId, currentCount + 1);
          return newMap;
        });
      } else if (conversationId === activeId) {
        // Message is for current conversation but from someone else - mark as unread if not from current user
        if (msg.sender !== user?.id) {
          console.log('Message from other user in current conversation, marking as unread');
          setUnreadMessages(prev => {
            const newMap = new Map(prev);
            const currentCount = newMap.get(conversationId) || 0;
            newMap.set(conversationId, currentCount + 1);
            return newMap;
          });
        }
      } else {
        console.log('Message not added - either wrong conversation, duplicate, or sent by us');
      }
    };
    
    socket.on('receive_message', handler);
    return () => { 
      console.log('Cleaning up socket handler for conversation:', activeId);
      socket.off('receive_message', handler); 
    };
  }, [socket, activeId, token]);

  // Auto-scroll when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [messages]);

  // Periodic refresh as fallback (every 5 seconds)
  useEffect(() => {
    if (!activeId || !token) return;
    
    const interval = setInterval(() => {
      fetch(`${API_BASE_URL}/api/chat/conversations/${activeId}/messages`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      }).then(r => r.json()).then((newMessages) => {
        setMessages(prev => {
          // Only update if we got new messages
          if (newMessages.length !== prev.length) {
            console.log('Periodic refresh: Got new messages', newMessages.length, 'vs', prev.length);
            return newMessages;
          }
          return prev;
        });
      }).catch(()=>{});
    }, 5000);

    return () => clearInterval(interval);
  }, [activeId, token]);

  const send = async () => {
    try {
      setError('');
      if (!text.trim() || !activeId) return;
      const res = await fetch(`${API_BASE_URL}/api/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ conversationId: activeId, text }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to send');
      
      // Add message immediately for better UX (fallback)
      setMessages(prev => [...prev, json]);
      setSentMessageIds(prev => new Set([...prev, json._id]));
      setText('');
      
      // Clear the sent message ID after 5 seconds to prevent accumulation
      setTimeout(() => {
        setSentMessageIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(json._id);
          return newSet;
        });
      }, 5000);
      
      // Scroll to bottom immediately
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
      
      // Emit to socket for real-time updates (for other users)
      if (socket && socket.connected) {
        console.log('Emitting message to socket for other users:', { 
          chatId: activeId, 
          conversationId: activeId, 
          text: json.text,
          sender: json.sender,
          _id: json._id,
          createdAt: json.createdAt,
          isFromSender: true // Flag to prevent our own message from being added again
        });
        socket.emit('send_message', { 
          chatId: activeId, 
          conversationId: activeId, 
          text: json.text,
          sender: json.sender,
          _id: json._id,
          createdAt: json.createdAt,
          isFromSender: true
        });
      } else {
        console.log('Socket not available or not connected for sending message');
        // Refresh messages as fallback
        setTimeout(() => {
          fetch(`${API_BASE_URL}/api/chat/conversations/${activeId}/messages`, {
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          }).then(r => r.json()).then(setMessages).catch(()=>{});
        }, 1000);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to send');
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
      const convo = await res.json();
      if (!res.ok) throw new Error(convo.error || 'Failed to start conversation');
      // Add or refresh convos
      const cv = await fetch(`${API_BASE_URL}/api/chat/conversations`, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } });
      const cvJson = await cv.json();
      setConvos(cvJson);
      setActiveId(convo._id || (cvJson[0]?._id));
      setShowComposer(false);
      setRecipientEmail('');
      setLookupUsers([]);
      setSelectedUser(null);
    } catch (e: any) {
      setError(e.message || 'Failed to start conversation');
    }
  };

  // Auto-lookup while typing (debounced)
  useEffect(() => {
    if (!token) return;
    const email = recipientEmail.trim();
    if (!email) { 
      setLookupUsers([]); 
      setSelectedUser(null);
      return; 
    }
    const t = setTimeout(async () => {
      try {
        setError('');
        const resp = await fetch(`${API_BASE_URL}/api/users/lookup?email=${encodeURIComponent(email)}`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        const ct = resp.headers.get('content-type') || '';
        const data = ct.includes('application/json') ? await resp.json() : { error: await resp.text() } as any;
        if (!resp.ok) { 
          setLookupUsers([]); 
          setSelectedUser(null);
          return; 
        }
        setLookupUsers(Array.isArray(data) ? data : [data]);
        setSelectedUser(null); // Reset selection when new search
      } catch {
        setLookupUsers([]);
        setSelectedUser(null);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [recipientEmail, token]);

  return (
    <div className="px-4 pt-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden" style={{ height: '80vh' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 h-full">
            {/* Conversations list */}
            <div className={`border-r p-4 overflow-y-auto ${activeId ? 'hidden md:block' : 'block'}`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                <button onClick={()=> setShowComposer(v=>!v)} className="px-3 py-1 rounded-full bg-(--color-green) text-white text-sm">New</button>
              </div>
              {showComposer && (
                <div className="mb-3 p-3 border border-gray-200 rounded-lg bg-gray-50 space-y-2 relative">
                  <input
                    value={recipientEmail}
                    onChange={(e)=>setRecipientEmail(e.target.value)}
                    placeholder="Recipient email"
                    className="w-full px-3 py-2 bg-white border border-gray-200 text-gray-800 rounded"
                  />
                  {lookupUsers.length > 0 && (
                    <div className="absolute left-0 right-0 top-[72px] z-10 bg-white border border-gray-200 rounded shadow max-h-48 overflow-y-auto">
                      {lookupUsers.map((user) => (
                        <div 
                          key={user.id} 
                          onClick={() => { setSelectedUser(user); setLookupUsers([]); startNewConversation(user); }}
                          className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                            selectedUser?.id === user.id ? 'bg-green-50 border-green-200' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              {user.profilePicture ? <img src={user.profilePicture} alt="pfp" className="w-full h-full object-cover"/> : <span className="text-xs text-gray-600">{(user.firstName||'U')[0]}{(user.lastName||'N')[0]}</span>}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm text-gray-900">{user.firstName} {user.lastName}</div>
                              <div className="text-xs text-gray-600">{user.email}</div>
                              <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                            </div>
                            {selectedUser?.id === user.id && (
                              <div className="text-green-600 text-sm">✓</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 justify-end">
                    <button onClick={()=>{setShowComposer(false); setRecipientEmail(''); setLookupUsers([]); setSelectedUser(null);}} className="px-3 py-1 rounded border border-gray-300 text-gray-700 text-sm">Cancel</button>
                    <button onClick={startNewConversation} disabled={!selectedUser} className={`px-3 py-1 rounded text-sm ${selectedUser ? 'bg-(--color-green) text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>Start</button>
                  </div>
                </div>
              )}
                <div className="space-y-2">
                 {isLoadingConversations ? (
                   <MessagesSkeleton />
                 ) : (
                   convos.map((c) => {
                  const participants = c.participants || c.users || c.members || [];
                  const meId = user?.id;
                  const other = participants.find((p: any) => (p?._id || p?.id) !== meId) || {};
                  const otherId = other._id || other.id;
                  const displayName = [other.firstName, other.lastName].filter(Boolean).join(' ') || other.name || other.email || 'Conversation';
                  const email = other.email || '';
                  const avatar = other.profilePicture;
                  const isActive = otherId && activeUsers.has(otherId);
                  const unreadCount = unreadMessages.get(c._id) || 0;
                  
                  return (
                    <button key={c._id} onClick={() => setActiveId(c._id)} className={`w-full text-left px-3 py-2 rounded-lg border ${activeId===c._id?'border-(--color-olive) bg-green-50':'border-gray-200 hover:bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {avatar ? <img src={avatar} alt="pfp" className="w-full h-full object-cover"/> : <span className="text-xs text-gray-600">{(displayName||'U')[0]}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="text-sm text-gray-900 truncate">{displayName}</div>
                            {other.role && (
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                other.role === 'seller' ? 'bg-green-100 text-green-800' : 
                                other.role === 'buyer' ? 'bg-blue-100 text-blue-800' : 
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {other.role}
                              </span>
                            )}
                            {isActive ? (
                              <span className="text-xs text-green-600 font-medium">Active now</span>
                            ) : (
                              <span className="text-xs text-gray-500">Offline</span>
                            )}
                          </div>
                          {email && <div className="text-xs text-gray-500 truncate">{email}</div>}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {/* New message indicator - only show if there are unread messages */}
                          {unreadCount > 0 && (
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          )}
                        </div>
                      </div>
                    </button>
                    );
                   })
                 )}
                 {!isLoadingConversations && convos.length===0 && <div className="text-sm text-gray-500">No conversations yet</div>}
              </div>
            </div>

            {/* Chat area */}
            <div className={`${activeId ? 'block' : 'hidden md:block'} col-span-2 relative`} style={{ height: '100%' }}>
              {/* Mobile back to conversations */}
              <div className="md:hidden sticky top-0 left-0 right-0 z-10 bg-white border-b px-3 py-2 flex items-center gap-3">
                <button
                  onClick={() => setActiveId(null)}
                  className="px-3 py-1 text-sm rounded border border-gray-300 text-gray-700"
                >
                  Back
                </button>
                <div className="text-sm text-gray-900 font-medium">Conversation</div>
              </div>
              
              {/* Chat Header - Profile info like Reddit */}
              {activeId && (
                <div className="sticky top-0 left-0 right-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between">
                  {(() => {
                    const participants = convos.find(c => c._id === activeId)?.participants || [];
                    const meId = user?.id;
                    const other = participants.find((p: any) => (p?._id || p?.id) !== meId) || {};
                    const displayName = [other.firstName, other.lastName].filter(Boolean).join(' ') || other.email || 'User';
                    const userEmail = other.email || '';
                    const isActive = activeUsers.has(other._id || other.id);
                    
                    return (
                      <>
                        <div 
                          className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors group"
                          onClick={() => window.open(`/user-profile/${userEmail}`, '_blank')}
                          title="View Profile"
                        >
                          <div className="relative">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              {other.profilePicture ? (
                                <img
                                  src={other.profilePicture}
                                  alt={displayName}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <span className="text-lg font-bold text-gray-600">
                                  {displayName.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            {isActive && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-base font-semibold text-gray-900 group-hover:text-green-600 transition-colors">{displayName}</div>
                            <div className="text-sm text-gray-500">
                              {isActive ? 'Active now' : 'Last seen recently'}
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => window.open(`/user-profile/${userEmail}`, '_blank')}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            title="View Profile"
                          >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </button>
                          <button
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            title="More options"
                          >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
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
                  top: activeId ? '80px' : '0px',
                  height: activeId ? 'calc(100% - 160px)' : 'calc(100% - 80px)', 
                  overflowY: 'auto',
                  padding: '16px'
                }}
              >
                <div className="space-y-3">
                  {activeId ? (
                    isLoadingMessages ? (
                      <ChatMessagesSkeleton />
                    ) : messages.length>0 ? (
                      <>
                        {messages.map((m, idx) => {
                        const created = new Date(m.createdAt || m.timestamp || m.updatedAt || Date.now());
                        const prev = messages[idx-1];
                        const prevCreated = prev ? new Date(prev.createdAt || prev.timestamp || prev.updatedAt || Date.now()) : null;
                        const isNewDay = !prev || created.toDateString() !== prevCreated?.toDateString();
                        const mine = (m.sender === user?.id);
                        return (
                          <div key={`${m._id || m.id || 'msg'}-${idx}-${created.getTime()}`} className="space-y-1">
                            {isNewDay && (
                              <div className="flex items-center gap-3 my-2">
                                <div className="flex-1 border-t border-gray-200"/>
                                <div className="text-xs text-gray-500">{created.toLocaleDateString()}</div>
                                <div className="flex-1 border-t border-gray-200"/>
                              </div>
                            )}
                            <div className={`flex ${mine?'justify-end':'justify-start'}`}>
                              <div className={`${mine?'bg-green text-white':'bg-white border border-gray-200 text-gray-800'} px-3 py-2 rounded-2xl max-w-[70%] text-sm`}>
                                <div>{m.text}</div>
                                <div className={`mt-1 text-[10px] ${mine?'text-green-100':'text-gray-500'}`}>{created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                              </div>
                            </div>
                          </div>
                        );
                        })}
                        <div ref={messagesEndRef} />
                      </>
                    ) : <div className="text-sm text-gray-500">No messages yet</div>
                  ) : <div className="text-sm text-gray-500">Select a conversation to start</div>}
                </div>
              </div>
              
              {/* Input area - fixed at bottom */}
              <div 
                className="absolute bottom-0 left-0 right-0 border-t p-3 flex items-center gap-3 bg-white" 
                style={{ height: '80px' }}
              >
                <input value={text} onChange={(e)=>setText(e.target.value)} onKeyDown={(e)=> e.key==='Enter' && send()} placeholder="Type a message..." className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-gray-800 border border-gray-200 outline-none" />
                <button onClick={send} className="px-4 py-2 rounded-full bg-(--color-green) text-white">Send</button>
              </div>
              {error && <div className="p-3 text-xs text-red-600">{error}</div>}
            </div>
          </div>
        
      </div>
    </div>
  );
}


