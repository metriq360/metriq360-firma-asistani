
import React, { useEffect, useRef } from 'react';
import { Bot, Users, Loader2, ArrowRight, Sparkles, MessageSquare, Copy, Layers, CheckCircle2, X, Download, Trash2 } from 'lucide-react';
import { PageHeader } from '../LayoutComponents.tsx';

const SUGGESTIONS = [
    "Bu sayfadaki verileri özetle",
    "Buradaki en büyük risk nedir?",
    "Performansı artırmak için ne yapmalıyım?",
    "Geçen aya göre durum ne?"
];

// --- SMART REPORT RENDERER v2.5 ---
// Enhanced list rendering with styled cards for numbered items
const AiReportRenderer = ({ text }: { text: string }) => {
    const sections = text.split('---').map(s => s.trim()).filter(s => s);

    return (
        <div className="space-y-4 w-full">
            {sections.map((section, secIdx) => {
                const lines = section.split('\n').filter(l => l.trim());
                if (lines.length === 0) return null;

                let title = "";
                let contentLines = lines;
                
                const firstLine = lines[0].trim();
                const looksLikeTitle = (firstLine.startsWith('**') || firstLine.startsWith('###') || !firstLine.includes(':')) && lines.length > 1;

                if (looksLikeTitle) {
                    title = firstLine.replace(/\*\*/g, '').replace(/###/g, '').trim();
                    contentLines = lines.slice(1);
                }

                const isMetricGrid = contentLines.every(l => l.includes(':') && (l.startsWith('*') || l.startsWith('-')));

                return (
                    <div key={secIdx} className="bg-slate-950/50 rounded-xl border border-slate-800 overflow-hidden">
                        {title && (
                            <div className="bg-slate-900/80 px-3 py-2 border-b border-slate-800 flex items-center gap-2">
                                <div className="w-1 h-3 bg-indigo-500 rounded-full"></div>
                                <h3 className="text-white font-bold text-xs uppercase tracking-wider">{title}</h3>
                            </div>
                        )}
                        
                        <div className="p-3">
                            {isMetricGrid ? (
                                <div className="grid grid-cols-1 gap-2">
                                    {contentLines.map((line, lIdx) => {
                                        const parts = line.replace(/^\*\s+/, '').replace(/^- /, '').split(':');
                                        if (parts.length < 2) return null;
                                        const label = parts[0].replace(/\*\*/g, '').trim();
                                        const value = parts.slice(1).join(':').replace(/\*\*/g, '').trim();
                                        
                                        const isPositive = value.includes('Artış') || value.includes('Yüksek') || (value.includes('%') && !value.includes('-'));
                                        const isNegative = value.includes('Düşüş') || value.includes('Düşük') || value.includes('Risk');

                                        return (
                                            <div key={lIdx} className="bg-slate-900 border border-slate-800 p-2 rounded flex justify-between items-center">
                                                <span className="text-slate-500 text-[10px] font-bold uppercase">{label}</span>
                                                <div className={`text-sm font-bold ${isNegative ? 'text-rose-400' : (isPositive ? 'text-emerald-400' : 'text-white')}`}>
                                                    {value}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {contentLines.map((line, lIdx) => {
                                        const cleanLine = line.trim();
                                        
                                        // Handle Numbered Lists (e.g., "1. Step one" or "1) Step one")
                                        if (cleanLine.match(/^\d+[\.\)]/)) {
                                            const numberMatch = cleanLine.match(/^\d+/);
                                            const number = numberMatch ? numberMatch[0] : '•';
                                            const text = cleanLine.replace(/^\d+[\.\)]/, '').trim().replace(/\*\*/g, '');
                                            return (
                                                <div key={lIdx} className="flex items-start gap-3 text-sm text-slate-300 mt-3 mb-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 hover:border-indigo-500/50 transition-all group shadow-sm hover:shadow-md hover:shadow-indigo-500/10 hover:bg-slate-800">
                                                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 text-xs font-extrabold shrink-0 border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all shadow-inner">{number}</span>
                                                    <span className="leading-relaxed pt-0.5 text-slate-200">{text}</span>
                                                </div>
                                            );
                                        }

                                        // Handle Bullet Points
                                        if (cleanLine.startsWith('*') || cleanLine.startsWith('-')) {
                                            const content = cleanLine.substring(1).trim().replace(/\*\*/g, '');
                                            return (
                                                <div key={lIdx} className="flex items-start gap-2 text-xs text-slate-300 ml-1 my-1">
                                                    <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0"/>
                                                    <span className="leading-relaxed">{content}</span>
                                                </div>
                                            );
                                        }

                                        // Regular Paragraphs
                                        return (
                                            <p key={lIdx} className="text-xs text-slate-400 leading-relaxed">
                                                {cleanLine.replace(/\*\*/g, '')}
                                            </p>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

interface AiAssistantProps {
    PageHeaderProps?: any;
    chatHistory: any[];
    aiMessage: string;
    setAiMessage: (msg: string) => void;
    handleAiChat: (msg?: string) => void;
    isAiThinking: boolean;
    mode?: 'full' | 'panel'; 
    onClose?: () => void;
    onClearChat?: () => void;
}

export const AiAssistantView = ({ PageHeaderProps, chatHistory, aiMessage, setAiMessage, handleAiChat, isAiThinking, mode = 'full', onClose, onClearChat }: AiAssistantProps) => {
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (chatContainerRef.current) {
            const timeoutId = setTimeout(() => {
                chatContainerRef.current?.scrollTo({
                    top: chatContainerRef.current.scrollHeight,
                    behavior: 'smooth'
                });
            }, 100);
            return () => clearTimeout(timeoutId);
        }
    }, [chatHistory, isAiThinking]);

    // Auto-focus input when AI finishes thinking or panel opens - Optimized
    useEffect(() => {
        if (!isAiThinking) {
            // Small delay ensures the DOM is ready and re-rendered before focusing
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [isAiThinking, mode]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAiChat();
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const handleDownloadChat = () => {
        if (chatHistory.length <= 1) return;
        
        let content = "METRIQ360 AI ASİSTAN - SOHBET GEÇMİŞİ\n";
        content += `Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}\n`;
        content += "========================================\n\n";

        chatHistory.forEach(msg => {
            const role = msg.role === 'bot' ? 'AI ASİSTAN' : 'KULLANICI';
            const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('tr-TR') : '-';
            content += `[${time}] ${role}:\n${msg.text}\n\n----------------------------------------\n\n`;
        });

        const element = document.createElement("a");
        const file = new Blob([content], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = `Metriq_Sohbet_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const isPanel = mode === 'panel';

    return (
        <div className={`flex flex-col h-full ${isPanel ? 'bg-slate-950' : 'space-y-6 animate-fade-in pb-20 max-w-5xl mx-auto'}`}>
            
            {isPanel ? (
                // Compact Header for Panel Mode
                <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md shrink-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
                            <Bot size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">Metriq AI Asistan</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[10px] text-slate-400 font-medium">Aktif Sayfayı İzliyor</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={handleDownloadChat} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors" title="Sohbeti İndir">
                            <Download size={18} />
                        </button>
                        <button onClick={onClearChat} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-colors" title="Sohbeti Temizle">
                            <Trash2 size={18} />
                        </button>
                        <div className="w-px h-4 bg-slate-800 mx-1"></div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>
            ) : (
                // Full Page Header
                <div className="shrink-0 flex justify-between items-end">
                    {PageHeaderProps && <PageHeader {...PageHeaderProps} title="Metriq AI" sub="Gemini Pro Destekli Akıllı Asistan" />}
                    <div className="flex gap-2 mb-6">
                        <button onClick={handleDownloadChat} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 border border-slate-700">
                            <Download size={16}/> Sohbeti İndir
                        </button>
                        <button onClick={onClearChat} className="bg-rose-900/20 hover:bg-rose-900/40 text-rose-400 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 border border-rose-900/30">
                            <Trash2 size={16}/> Temizle
                        </button>
                    </div>
                </div>
            )}
            
            <div className={`flex-1 bg-slate-950 flex flex-col relative min-h-0 ${!isPanel ? 'rounded-2xl border border-slate-800 shadow-2xl h-[80vh]' : ''}`}>
                
                {/* Chat Area */}
                <div 
                    ref={chatContainerRef}
                    className={`flex-1 p-4 overflow-y-auto min-h-0 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 ${isPanel ? 'pb-4' : 'md:p-8'}`}
                >
                    {chatHistory.map((msg: any, i: number) => {
                        const isBot = msg.role === 'bot';
                        return (
                            <div key={i} className={`flex ${isBot ? 'justify-start' : 'justify-end'} group`}>
                                <div className={`flex gap-3 max-w-[95%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                                    
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-lg mt-1 ${isBot ? 'bg-gradient-to-br from-indigo-600 to-violet-600' : 'bg-slate-800 border border-slate-700'}`}>
                                        {isBot ? <Sparkles size={14} className="text-white"/> : <Users size={14} className="text-slate-400"/>}
                                    </div>

                                    {/* Message Bubble */}
                                    <div className={`relative p-1 rounded-2xl transition-all w-full ${isBot ? 'bg-slate-900 border border-slate-800' : 'bg-indigo-600 text-white w-auto'}`}>
                                        <div className={`p-3 rounded-xl ${isBot ? 'bg-slate-950/30' : ''}`}>
                                            {isBot ? (
                                                <div className="w-full min-w-[200px]">
                                                    <AiReportRenderer text={msg.text} />
                                                    <div className="mt-2 pt-2 flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity border-t border-slate-800/50">
                                                        <button onClick={() => copyToClipboard(msg.text)} className="text-[10px] text-slate-500 hover:text-white flex items-center gap-1 transition-colors uppercase font-bold tracking-wider" title="Kopyala">
                                                            <Copy size={10}/>
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="whitespace-pre-wrap text-xs md:text-sm font-medium leading-relaxed">{msg.text}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    
                    {isAiThinking && (
                       <div className="flex justify-start">
                         <div className="flex gap-3 max-w-[85%]">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shrink-0 animate-pulse mt-1">
                                <Loader2 className="animate-spin text-white" size={14}/>
                            </div>
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-4 flex items-center gap-2 shadow-sm">
                               <div className="flex space-x-1">
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                               </div>
                               <span className="text-xs text-slate-500 font-medium">Veriler analiz ediliyor...</span>
                            </div>
                         </div>
                       </div>
                    )}

                    {/* Suggestions (Only show if chat is empty/short) */}
                    {chatHistory.length < 2 && !isAiThinking && (
                        <div className="mt-8 px-2">
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider text-center mb-4">Önerilen Sorular</p>
                            <div className="grid grid-cols-1 gap-2">
                                {SUGGESTIONS.map((s, idx) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => handleAiChat(s)}
                                        className="text-left bg-slate-900 hover:bg-indigo-900/20 border border-slate-800 hover:border-indigo-500/30 p-3 rounded-xl text-xs text-slate-400 hover:text-indigo-300 transition-all flex items-center gap-2 group"
                                    >
                                        <MessageSquare size={12} className="text-slate-600 group-hover:text-indigo-500"/> {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-slate-950 border-t border-slate-800 shrink-0 z-10">
                    <div className="relative flex gap-2">
                        <div className="relative flex-1">
                            <input 
                              ref={inputRef}
                              className="w-full bg-slate-900 border border-slate-700 text-white pl-4 pr-10 py-3 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600 shadow-inner" 
                              placeholder="Bir soru sorun..." 
                              value={aiMessage} 
                              onChange={(e) => setAiMessage(e.target.value)} 
                              onKeyDown={handleKeyDown}
                              disabled={isAiThinking}
                              autoFocus={isPanel}
                              autoComplete="off"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded bg-slate-800 border border-slate-700 text-slate-500">
                                <Layers size={12} />
                            </div>
                        </div>
                        <button 
                            onClick={() => handleAiChat()} 
                            disabled={isAiThinking || !aiMessage.trim()} 
                            className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-indigo-500/20"
                        >
                            <ArrowRight size={18} />
                        </button>
                    </div>
                    {isPanel && (
                        <div className="text-center mt-2 flex items-center justify-center gap-2">
                            <p className="text-[9px] text-slate-600">Gemini 2.5 Flash &bull; Canlı Veri Bağlantısı</p>
                            <span className="text-[9px] text-slate-700">&bull;</span>
                            <p className="text-[9px] text-slate-600">Son 50 mesaj saklanır</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
