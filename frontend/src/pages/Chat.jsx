import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function Avatar({ name, src, size = 'md', online = false }) {
  const sizes = { xs: 'w-7 h-7 text-xs', sm: 'w-9 h-9 text-sm', md: 'w-11 h-11 text-base', lg: 'w-16 h-16 text-xl', xl: 'w-24 h-24 text-3xl' };
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  return (
    <div className="relative shrink-0">
      {src ? (
        <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover`} />
      ) : (
        <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold`}>{initials}</div>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
      )}
    </div>
  );
}

export default function Chat({ userRole }) {
  const { user, token, logout } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // { _id, name, role, email... }
  const [activeChatProfile, setActiveChatProfile] = useState(null); // student profile
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [searchConv, setSearchConv] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const fileInputRef = useRef(null);
  const socket = useRef(null);
  const location = useLocation();
  const messagesEndRef = useRef(null);

  const EMOJI_LIST = ['😀', '😂', '😍', '😎', '🙏', '🔥', '🚀', '✨', '💯', '🤔', '👍', '❤️', '🎉', '💡', '✅'];

  // Init socket
  useEffect(() => {
    socket.current = io('http://localhost:5000', { auth: { token } });

    if (user?._id) {
      socket.current.emit('join', user._id);
    }

    socket.current.on('receive_message', (msg) => {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.find(m => m._id && m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      fetchConversations();
    });

    socket.current.on('user_status', (users) => setOnlineUsers(users));

    socket.current.on('message_deleted', (data) => {
      setMessages(prev => prev.map(m => {
        if (m._id === data.messageId && data.type === 'everyone') {
          return { ...m, text: '🚫 This message was deleted', attachment: null, attachmentType: null, deletedForEveryone: true };
        }
        return m;
      }));
    });

    return () => socket.current?.disconnect();
  }, [token, user?._id]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/messages/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data);
    } catch { }
  };

  useEffect(() => { if (token) fetchConversations(); }, [token]);

  // Handle URL ?student= param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const studentId = params.get('student');
    if (studentId && token) startNewChat(studentId);
  }, [location.search, token]);

  const startNewChat = async (targetUserId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/messages/history/${targetUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data.messages || []);
      setActiveChat(res.data.targetUser);
      setShowProfilePanel(false);

      // Fetch profile for profile panel (try Student first, then Recruiter)
      try {
        const profileRes = await axios.get(`http://localhost:5000/api/students/${targetUserId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setActiveChatProfile({ ...profileRes.data, userRole: 'student' });
      } catch {
        try {
          const recRes = await axios.get(`http://localhost:5000/api/recruiters/${targetUserId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setActiveChatProfile({ ...recRes.data, userRole: 'recruiter' });
        } catch {
          setActiveChatProfile(null);
        }
      }
    } catch (err) {
      console.error('Failed to load chat:', err);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachment) || !activeChat || !socket.current) return;

    socket.current.emit('send_message', {
      senderId: user._id,
      receiver: activeChat._id,
      text: newMessage.trim(),
      attachment: attachment,
      attachmentType: attachment ? 'image' : null
    });

    setNewMessage('');
    setAttachment(null);
    setShowEmojis(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAttachment(ev.target.result);
    // Max size ~5MB for safety
    if (file.size > 5 * 1024 * 1024) return alert('File too big!');
    reader.readAsDataURL(file);
    e.target.value = ''; // reset
  };

  const handleDownload = (url) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'download'; 
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setActiveDropdown(null);
  };

  const handleDelete = async (msgId, type) => {
    try {
      await axios.delete(`http://localhost:5000/api/messages/${msgId}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { type }
      });
      if (type === 'everyone') {
        socket.current.emit('delete_message', { messageId: msgId, receiverId: activeChat._id, type });
        setMessages(prev => prev.map(m => m._id === msgId ? { ...m, text: '🚫 This message was deleted', attachment: null, deletedForEveryone: true } : m));
      } else {
        setMessages(prev => prev.filter(m => m._id !== msgId));
      }
    } catch (err) {
      alert(err.response?.data?.msg || 'Could not delete message');
    }
    setActiveDropdown(null);
  };

  const currentUserId = user?._id?.toString() || user?.id?.toString();

  const filteredConvs = conversations.filter(c => {
    // Never show yourself as a conversation partner
    if (c.targetUser?._id?.toString() === currentUserId) return false;
    return !searchConv || c.targetUser?.name?.toLowerCase().includes(searchConv.toLowerCase());
  });

  const isOnline = (id) => onlineUsers.includes(id);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 font-body">

      {/* ── Panel 1: Conversations List ── */}
      <div className="w-80 lg:w-96 bg-white border-r border-slate-100 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">Messages</h2>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input
              className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Search conversations..."
              value={searchConv}
              onChange={e => setSearchConv(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 px-6 text-center">
              <span className="material-symbols-outlined text-5xl mb-3">forum</span>
              <p className="font-semibold text-sm">No conversations yet</p>
              <p className="text-xs mt-1">
                {userRole === 'recruiter' ? 'Search talent and click "Message" to start chatting.' : 'Recruiters will reach out to you here.'}
              </p>
            </div>
          ) : filteredConvs.map(conv => (
            <div
              key={conv._id}
              onClick={() => startNewChat(conv.targetUser._id)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-slate-50 ${activeChat?._id === conv.targetUser._id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
            >
              <Avatar name={conv.targetUser?.name} size="md" online={isOnline(conv.targetUser._id)} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-bold truncate ${activeChat?._id === conv.targetUser._id ? 'text-blue-700' : 'text-slate-900'}`}>
                    {conv.targetUser?.name}
                  </span>
                  <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                    {(() => {
                      const d = new Date(conv.lastMessage?.createdAt);
                      const today = new Date();
                      return d.toDateString() === today.toDateString()
                        ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
                    })()}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">{conv.lastMessage?.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Panel 2: Chat Window ── */}
      <div className="flex-1 flex flex-col bg-slate-50 min-w-0">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
              <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => setShowProfilePanel(!showProfilePanel)}
              >
                <Avatar name={activeChat.name} size="sm" online={isOnline(activeChat._id)} />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">{activeChat.name}</h3>
                  <p className={`text-[10px] font-bold ${isOnline(activeChat._id) ? 'text-green-500' : 'text-slate-400'} uppercase tracking-widest flex items-center gap-1`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline(activeChat._id) ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                    {isOnline(activeChat._id) ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowProfilePanel(!showProfilePanel)}
                  className={`p-2 rounded-xl transition-colors ${showProfilePanel ? 'bg-blue-50 text-blue-700' : 'text-slate-400 hover:bg-slate-100'}`}
                  title="View Profile"
                >
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-300 text-center">
                  <span className="material-symbols-outlined text-6xl mb-3" style={{ fontVariationSettings: "'wght' 100" }}>chat_bubble</span>
                  <p className="font-bold text-sm">Start the conversation!</p>
                  <p className="text-xs mt-1">Say hello to {activeChat.name}.</p>
                </div>
              )}
              {messages.map((msg, idx) => {
                const isMe = msg.sender === user?._id || msg.sender?._id === user?._id;
                const showAvatar = !isMe && (idx === 0 || messages[idx - 1]?.sender !== msg.sender);
                return (
                  <div key={msg._id || idx} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                    {!isMe && (
                      <div className={`${showAvatar ? 'opacity-100' : 'opacity-0'} pointer-events-none`}>
                        <Avatar name={activeChat.name} size="xs" />
                      </div>
                    )}
                    <div className={`flex flex-col max-w-xs lg:max-w-sm relative group ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`overflow-visible rounded-2xl text-sm shadow-sm flex flex-col relative ${isMe ? 'bg-blue-700 text-white rounded-br-md' : 'bg-white text-slate-800 border border-slate-100 rounded-bl-md'}`}>
                        {/* 3 dots menu button */}
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === msg._id ? null : msg._id)}
                          className={`absolute top-2 ${isMe ? 'right-2 bg-blue-800' : 'right-2 bg-slate-100'} w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-opacity-80`}
                        >
                          <span className="material-symbols-outlined text-[16px]">more_vert</span>
                        </button>

                        {/* Dropdown Menu */}
                        {activeDropdown === msg._id && (
                          <div className={`absolute top-8 ${isMe ? 'right-0' : 'left-0'} bg-white border border-slate-200 shadow-xl rounded-xl py-1 w-48 z-50`}>
                            {msg.attachment && (
                              <button onClick={() => handleDownload(msg.attachment)} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">download</span> Download
                              </button>
                            )}
                            <button onClick={() => handleDelete(msg._id, 'me')} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2">
                               <span className="material-symbols-outlined text-[16px]">delete</span> Delete for me
                            </button>
                            {isMe && !msg.deletedForEveryone && (
                              <button onClick={() => handleDelete(msg._id, 'everyone')} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 border-t border-slate-100 text-xs font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">delete_forever</span> Delete for everyone
                              </button>
                            )}
                          </div>
                        )}

                        {msg.attachment && (
                          <img src={msg.attachment} alt="attachment" className="max-w-[200px] w-full object-cover" />
                        )}
                        {msg.text && (
                          <div className={`px-4 ${msg.attachment ? 'pb-2.5 pt-1' : 'py-2.5'} leading-relaxed ${isMe ? 'pr-8' : 'pr-8'}`}>
                            {msg.text}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-slate-100 p-4 shrink-0 relative">
              {attachment && (
                <div className="mb-2 relative inline-block">
                  <img src={attachment} alt="preview" className="h-16 w-16 object-cover rounded-lg border border-slate-200" />
                  <button onClick={() => setAttachment(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">×</button>
                </div>
              )}
              {showEmojis && (
                <div className="absolute bottom-[70px] left-4 bg-white border border-slate-200 shadow-xl rounded-2xl p-2 w-64 z-50 flex flex-wrap gap-1">
                  {EMOJI_LIST.map(e => (
                    <button key={e} type="button" onClick={() => setNewMessage(p => p + e)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg text-lg">
                      {e}
                    </button>
                  ))}
                </div>
              )}
              <form onSubmit={sendMessage} className="flex items-center gap-2 bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-blue-300 px-3 py-2 transition-colors">
                <button type="button" onClick={() => setShowEmojis(!showEmojis)} className="text-slate-400 hover:text-slate-600 transition-colors p-1" title="Emojis">
                  <span className="material-symbols-outlined text-[20px]">sentiment_satisfied</span>
                </button>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-slate-400 hover:text-slate-600 transition-colors p-1" title="Attach Photo">
                  <span className="material-symbols-outlined text-[20px]">image</span>
                </button>
                <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleFileChange} />
                
                <input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder-slate-400 px-2"
                  placeholder={`Message ${activeChat.name}...`}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() && !attachment}
                  className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center hover:bg-blue-800 transition-colors disabled:opacity-40 disabled:cursor-default shrink-0"
                >
                  <span className="material-symbols-outlined text-[18px] ml-1">send</span>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
            <span className="material-symbols-outlined text-8xl mb-4" style={{ fontVariationSettings: "'wght' 100" }}>forum</span>
            <p className="font-bold text-slate-400 text-lg">Select a conversation</p>
            <p className="text-sm text-slate-300 mt-1">Choose a conversation from the left to start messaging</p>
          </div>
        )}
      </div>

      {/* ── Panel 3: Profile Side Panel (LinkedIn style) ── */}
      {showProfilePanel && activeChat && (
        <div className="w-[340px] bg-white border-l border-slate-100 flex flex-col overflow-y-auto shrink-0 animate-slide-in">

          {/* Gradient cover */}
          <div className="h-28 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 relative shrink-0 overflow-hidden">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)' }}
            />
            <button
              onClick={() => setShowProfilePanel(false)}
              className="absolute top-3.5 left-3.5 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
            <p className="absolute bottom-3 right-4 text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">
              Profile
            </p>
          </div>

          {/* Avatar + name */}
          <div className="px-5 pb-6">
            {/* Avatar overlapping the cover */}
            <div className="relative -mt-10 mb-3 w-fit">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-[1.5rem] blur opacity-30" />
              {activeChatProfile?.profilePicture ? (
                <img
                  src={activeChatProfile.profilePicture}
                  alt={activeChat.name}
                  className="relative w-20 h-20 rounded-[1.25rem] object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="relative w-20 h-20 rounded-[1.25rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
                  {activeChat.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                </div>
              )}
            </div>

            {/* Name + role + location */}
            <h2 className="text-xl font-extrabold text-slate-900 leading-tight">{activeChat.name}</h2>
            {(activeChatProfile?.major || activeChatProfile?.position) && (
              <p className="text-sm text-slate-500 font-medium mt-0.5">
                {activeChatProfile.userRole === 'recruiter' 
                   ? `${activeChatProfile.position} at ${activeChatProfile.companyName}` 
                   : activeChatProfile.major}
              </p>
            )}
            {activeChatProfile?.location && (
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                {activeChatProfile.location}
              </p>
            )}

            {/* Online badge */}
            <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-[11px] font-bold ${isOnline(activeChat._id) ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline(activeChat._id) ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
              {isOnline(activeChat._id) ? 'Online Now' : 'Offline'}
            </div>

            <div className="mt-6 space-y-4">
              {/* About */}
              {activeChatProfile?.bio && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    <span className="w-4 h-0.5 bg-blue-600 rounded-full" />About
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{activeChatProfile.bio}</p>
                </div>
              )}

              {/* Expertise */}
              {activeChatProfile?.skills?.length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    <span className="w-4 h-0.5 bg-indigo-500 rounded-full" />Expertise
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeChatProfile.skills.slice(0, 10).map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-white text-slate-700 text-xs font-semibold rounded-full border border-slate-200 shadow-sm">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Education — Timeline */}
              {activeChatProfile?.education?.length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    <span className="w-4 h-0.5 bg-emerald-500 rounded-full" />Education
                  </h4>
                  <div className="space-y-0">
                    {activeChatProfile.education.map((edu, i) => {
                      const isLast = i === activeChatProfile.education.length - 1;
                      const isSchool = !edu.degree || edu.degree.toLowerCase().includes('school') || edu.fieldOfStudy?.toLowerCase().includes('school');
                      return (
                        <div key={i} className="flex gap-3 relative">
                          {!isLast && (
                            <div className="absolute left-[13px] top-8 bottom-0 w-px bg-slate-200" />
                          )}
                          <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 z-10 shadow-sm mt-0.5">
                            <span className="material-symbols-outlined text-blue-500 text-[14px]">
                              {isSchool ? 'school' : 'account_balance'}
                            </span>
                          </div>
                          <div className={`min-w-0 flex-1 ${!isLast ? 'pb-5' : 'pb-1'}`}>
                            <p className="text-sm font-bold text-slate-800 leading-tight">{edu.school}</p>
                            {(edu.degree || edu.fieldOfStudy) && (
                              <p className="text-xs text-slate-500 mt-0.5">
                                {[edu.degree, edu.fieldOfStudy].filter(Boolean).join(' · ')}
                              </p>
                            )}
                            {edu.startYear && (
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {edu.startYear}–{edu.endYear || 'Present'}
                                {edu.grade && <span className="ml-2 font-semibold">{edu.grade}</span>}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  <span className="w-4 h-0.5 bg-violet-500 rounded-full" />Contact Info
                </h4>
                <div className="space-y-2.5">
                  {[
                    { icon: 'person', title: 'Profile', value: `academiccurator.com/in/${activeChat.name?.toLowerCase().replace(/\s+/g, '-')}`, href: '#' },
                    { icon: 'mail', title: 'Email', value: activeChat.email, href: `mailto:${activeChat.email}` },
                    { icon: 'call', title: 'Phone', value: activeChatProfile?.phone, href: null },
                    { icon: 'code', title: 'GitHub', value: activeChatProfile?.github, href: activeChatProfile?.github },
                    { icon: 'work', title: 'LinkedIn', value: activeChatProfile?.linkedin, href: activeChatProfile?.linkedin },
                    { icon: 'language', title: 'Portfolio', value: activeChatProfile?.websiteUrl, href: activeChatProfile?.websiteUrl },
                  ].filter(c => c.value).map((c, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-slate-500 text-[18px] mt-0.5 shrink-0">{c.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{c.title}</p>
                        {c.href ? (
                          <a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline truncate block">
                            {c.value}
                          </a>
                        ) : (
                          <p className="text-xs text-slate-600 truncate">{c.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      <style>{`
        @keyframes slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-in { animation: slide-in 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
}
