import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useUser } from '../../context/UserContext';
import * as messageService from '../../services/messageService';

const personName = (person) => person?.fullName || person?.name || person?.email || 'User';
const personAvatar = (person) => person?.avatar || person?.profilePicture || '';
const idOf = (value) => String(value?._id || value || '');
const formatTime = (value) => value
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
    : '';

const ConversationPage = ({ role }) => {
    const { user } = useUser();
    const [searchParams, setSearchParams] = useSearchParams();
    const [conversations, setConversations] = useState([]);
    const [selectedId, setSelectedId] = useState(searchParams.get('conversationId') || '');
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    const selectedConversation = useMemo(
        () => conversations.find((conversation) => idOf(conversation) === selectedId),
        [conversations, selectedId]
    );
    const participant = selectedConversation?.[role === 'client' ? 'freelancer' : 'client'];

    const selectConversation = useCallback((conversationId) => {
        setSelectedId(conversationId);
        setSearchParams({ conversationId });
        setError('');
    }, [setSearchParams]);

    useEffect(() => {
        let active = true;
        const loadConversations = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await messageService.getConversations();
                if (!active) return;
                const items = response.success && Array.isArray(response.data) ? response.data : [];
                setConversations(items);
                const requestedId = searchParams.get('conversationId');
                if (requestedId && items.some((item) => idOf(item) === requestedId)) {
                    setSelectedId(requestedId);
                } else if (requestedId) {
                    setSelectedId('');
                    setError('Conversation not found or you do not have access to it.');
                }
            } catch (requestError) {
                if (active) setError(requestError.message || 'Failed to load conversations.');
            } finally {
                if (active) setLoading(false);
            }
        };
        loadConversations();
        return () => { active = false; };
    }, [searchParams]);

    useEffect(() => {
        let active = true;
        if (!selectedId) {
            setMessages([]);
            return () => { active = false; };
        }
        const loadMessages = async () => {
            setMessagesLoading(true);
            setError('');
            try {
                const response = await messageService.getMessages(selectedId);
                if (active) setMessages(response.success && Array.isArray(response.data) ? response.data : []);
            } catch (requestError) {
                if (active) setError(requestError.message || 'Failed to load messages.');
            } finally {
                if (active) setMessagesLoading(false);
            }
        };
        loadMessages();
        return () => { active = false; };
    }, [selectedId]);

    const handleSend = async () => {
        const trimmed = text.trim();
        if (!trimmed || !selectedId || sending) return;
        setSending(true);
        setError('');
        try {
            const response = await messageService.sendMessage(selectedId, trimmed);
            if (!response.success || !response.data) throw new Error(response.message || 'Failed to send message.');
            setMessages((current) => [...current, response.data]);
            setText('');
            setConversations((current) => current
                .map((conversation) => idOf(conversation) === selectedId
                    ? { ...conversation, lastMessage: response.data.text, lastMessageAt: response.data.createdAt }
                    : conversation)
                .sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0))
            );
        } catch (requestError) {
            const message = requestError.message || 'Failed to send message.';
            setError(message);
            toast.error(message);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="space-y-6 min-w-0">
            <div>
                <h1 className="font-headline-md text-2xl font-bold text-on-surface">Messages</h1>
                <p className="text-on-surface-variant text-body-sm mt-1">Communicate directly with your {role === 'client' ? 'freelancers' : 'clients'}</p>
            </div>

            {error && <div className="rounded-xl border border-error/30 bg-error/10 p-3 text-body-sm text-error">{error}</div>}

            <div className="grid min-h-[34rem] max-h-[calc(100vh-12rem)] grid-cols-1 overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-low lg:grid-cols-[20rem_minmax(0,1fr)]">
                <aside className={`${selectedId ? 'hidden lg:block' : 'block'} min-w-0 overflow-y-auto border-r border-outline-variant/20`}>
                    {loading ? (
                        <div className="p-6 text-body-sm text-on-surface-variant">Loading conversations…</div>
                    ) : conversations.length === 0 ? (
                        <div className="flex flex-col items-center px-6 py-20 text-center">
                            <MessageSquare className="mb-4 h-10 w-10 text-primary" />
                            <h2 className="font-headline-sm font-bold text-on-surface">No Messages Yet</h2>
                            <p className="mt-2 text-body-sm text-on-surface-variant">Your conversations will appear here.</p>
                        </div>
                    ) : conversations.map((conversation) => {
                        const other = conversation[role === 'client' ? 'freelancer' : 'client'];
                        const conversationId = idOf(conversation);
                        return (
                            <button
                                type="button"
                                key={conversationId}
                                onClick={() => selectConversation(conversationId)}
                                className={`flex w-full min-w-0 gap-3 border-b border-outline-variant/10 p-4 text-left transition-colors ${selectedId === conversationId ? 'bg-primary/10' : 'hover:bg-surface-variant/30'}`}
                            >
                                {personAvatar(other) ? <img src={personAvatar(other)} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" /> : (
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary font-bold">{personName(other).charAt(0)}</div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="truncate font-semibold text-on-surface">{personName(other)}</span>
                                        <span className="shrink-0 text-[10px] text-on-surface-variant">{formatTime(conversation.lastMessageAt)}</span>
                                    </div>
                                    <p className="truncate text-body-sm text-on-surface-variant">{conversation.lastMessage || 'Start the conversation'}</p>
                                </div>
                            </button>
                        );
                    })}
                </aside>

                <section className={`${selectedId ? 'flex' : 'hidden lg:flex'} min-w-0 flex-col`}>
                    {!selectedConversation ? (
                        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-on-surface-variant">
                            <MessageSquare className="mb-4 h-10 w-10 text-primary" />
                            <p>Select a conversation to view its messages.</p>
                        </div>
                    ) : (
                        <>
                            <header className="flex items-center gap-3 border-b border-outline-variant/20 p-4">
                                <button type="button" onClick={() => { setSelectedId(''); setSearchParams({}); }} className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-variant/40 lg:hidden" aria-label="Back to conversations">
                                    <ArrowLeft className="h-5 w-5" />
                                </button>
                                {personAvatar(participant) && <img src={personAvatar(participant)} alt="" className="h-10 w-10 rounded-full object-cover" />}
                                <h2 className="truncate font-bold text-on-surface">{personName(participant)}</h2>
                            </header>

                            <div className="flex-1 space-y-3 overflow-y-auto p-4">
                                {messagesLoading ? <p className="text-body-sm text-on-surface-variant">Loading messages…</p> : messages.length === 0 ? (
                                    <p className="py-12 text-center text-body-sm text-on-surface-variant">No messages yet. Say hello.</p>
                                ) : messages.map((message) => {
                                    const mine = idOf(message.sender) === idOf(user);
                                    return (
                                        <div key={idOf(message)} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2 text-body-sm ${mine ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface'}`}>
                                                <p>{message.text}</p>
                                                <p className="mt-1 text-[10px] opacity-70">{formatTime(message.createdAt)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex items-end gap-2 border-t border-outline-variant/20 bg-surface-container-low p-3">
                                <textarea
                                    value={text}
                                    onChange={(event) => setText(event.target.value)}
                                    onKeyDown={handleKeyDown}
                                    rows={1}
                                    maxLength={2000}
                                    placeholder="Write a message…"
                                    className="max-h-28 min-h-11 min-w-0 flex-1 resize-y rounded-xl border border-outline-variant/30 bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
                                />
                                <button
                                    type="button"
                                    onClick={handleSend}
                                    disabled={!text.trim() || sending}
                                    className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-primary px-4 text-on-primary disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Send className="h-4 w-4" />
                                    <span className="hidden sm:inline">{sending ? 'Sending…' : 'Send'}</span>
                                </button>
                            </div>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
};

export default ConversationPage;
