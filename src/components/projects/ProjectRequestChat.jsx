import React, { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import * as messageService from '../../services/messageService';

const idOf = (value) => String(value?._id || value || '');

const ProjectRequestChat = ({ projectRequestId, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadMessages = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await messageService.getProjectRequestMessages(projectRequestId);
        if (active) setMessages(response.success && Array.isArray(response.data) ? response.data : []);
      } catch (requestError) {
        if (active) setError(requestError.message || 'Failed to load project request messages.');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadMessages();
    return () => { active = false; };
  }, [projectRequestId]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError('');
    try {
      const response = await messageService.sendProjectRequestMessage(projectRequestId, trimmed);
      if (!response.success || !response.data) throw new Error(response.message || 'Failed to send message.');
      setMessages(current => [...current, response.data]);
      setText('');
    } catch (requestError) {
      const message = requestError.message || 'Failed to send message.';
      setError(message);
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="mt-5 border-t border-outline-variant/20 pt-5">
      <div className="max-h-64 space-y-3 overflow-y-auto rounded-xl bg-surface-container-low/50 p-4">
        {loading ? (
          <p className="text-body-sm text-on-surface-variant">Loading messages…</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-body-sm text-on-surface-variant">No messages yet. Start the discussion before accepting this request.</p>
        ) : messages.map(message => {
          const mine = idOf(message.sender) === idOf(currentUser);
          return (
            <div key={idOf(message)} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-body-sm whitespace-pre-wrap break-words ${mine ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface'}`}>
                <p>{message.text}</p>
                <p className="mt-1 text-[10px] opacity-70">{new Date(message.createdAt).toLocaleString()}</p>
              </div>
            </div>
          );
        })}
      </div>
      {error && <p className="mt-2 text-body-sm text-error">{error}</p>}
      <div className="mt-3 flex items-end gap-2">
        <textarea
          value={text}
          onChange={event => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          maxLength={2000}
          placeholder="Write a message…"
          className="min-h-11 min-w-0 flex-1 resize-y rounded-xl border border-outline-variant/30 bg-surface px-3 py-2 text-on-surface focus:border-primary focus:outline-none"
        />
        <button type="button" onClick={handleSend} disabled={!text.trim() || sending} className="flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-on-primary disabled:cursor-not-allowed disabled:opacity-50">
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">{sending ? 'Sending…' : 'Send'}</span>
        </button>
      </div>
    </div>
  );
};

export default ProjectRequestChat;
