import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  Clock,
  MessageCircle,
  Check,
  CreditCard,
  Sparkles
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import { sendWhatsAppMessage } from '@/api/evolutionWhatsApp';
import { getAIConfig, saveAIConfig } from '@/api/aiClient';

const FunctionDisplay = ({ toolCall }) => {
    const [expanded, setExpanded] = useState(false);
    const name = toolCall?.name || 'Function';
    const status = toolCall?.status || 'pending';
    const results = toolCall?.results;
    
    const parsedResults = (() => {
        if (!results) return null;
        try {
            return typeof results === 'string' ? JSON.parse(results) : results;
        } catch {
            return results;
        }
    })();
    
    const isError = results && (
        (typeof results === 'string' && /error|failed/i.test(results)) ||
        (parsedResults?.success === false)
    );
    
    // Special highlight for recorded transactions
    if (name === "record_transaction_in_app" && parsedResults?.success) {
        let args = {};
        try {
            args = typeof toolCall.arguments_string === "string" ? JSON.parse(toolCall.arguments_string) : (toolCall.arguments_string || {});
        } catch {
            // keep empty
        }

        const isExpense = args.type !== "income";
        return (
            <div className="mt-2.5 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/30 text-xs shadow-[0_0_24px_-8px_rgba(16,185,129,0.3)] backdrop-blur-xl">
                <div className="flex items-center justify-between font-semibold text-emerald-300 mb-1">
                    <span className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                        Recorded in App Database
                    </span>
                    <span className={cn(
                        "font-bold tabular-numbers text-sm",
                        isExpense ? "text-rose-400" : "text-emerald-400"
                    )}>
                        {isExpense ? "-" : "+"}${Number(args.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>
                <div className="text-[11px] text-zinc-300 flex items-center justify-between pt-1 border-t border-emerald-500/15">
                    <span>{args.description || "Transaction"} • <strong className="text-white">{args.category || "General"}</strong></span>
                    <span className="text-zinc-400 uppercase tracking-wider">{args.payment_method || "Card"}</span>
                </div>
            </div>
        );
    }
    
    const statusConfig = {
        pending: { icon: Clock, color: 'text-zinc-400', text: 'Pending' },
        running: { icon: Loader2, color: 'text-violet-400', text: 'Processing...', spin: true },
        in_progress: { icon: Loader2, color: 'text-violet-400', text: 'Processing...', spin: true },
        completed: isError ? 
            { icon: AlertCircle, color: 'text-rose-400', text: 'Failed' } : 
            { icon: CheckCircle2, color: 'text-emerald-400', text: 'Executed' },
        success: { icon: CheckCircle2, color: 'text-emerald-400', text: 'Executed' },
        failed: { icon: AlertCircle, color: 'text-rose-400', text: 'Failed' },
        error: { icon: AlertCircle, color: 'text-rose-400', text: 'Failed' }
    }[status] || { icon: Zap, color: 'text-zinc-400', text: '' };
    
    const Icon = statusConfig.icon;
    const formattedName = name.split('.').reverse().join(' ').toLowerCase();
    
    return (
        <div className="mt-2 text-xs">
            <button
                onClick={() => setExpanded(!expanded)}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium",
                    expanded ? "bg-white/[0.08] border-white/[0.15] text-white" : "bg-white/[0.03] border-white/[0.06] text-zinc-300 hover:bg-white/[0.06]"
                )}
            >
                <Icon className={cn("h-3 w-3", statusConfig.color, statusConfig.spin && "animate-spin")} />
                <span>{formattedName}</span>
                {statusConfig.text && (
                    <span className={cn("text-zinc-400", isError && "text-rose-400")}>
                        • {statusConfig.text}
                    </span>
                )}
                {!statusConfig.spin && (toolCall.arguments_string || results) && (
                    <ChevronRight className={cn("h-3 w-3 text-zinc-500 transition-transform ml-auto", 
                        expanded && "rotate-90")} />
                )}
            </button>
            
            {expanded && !statusConfig.spin && (
                <div className="mt-1.5 ml-3 pl-3 border-l-2 border-white/[0.1] space-y-2">
                    {toolCall.arguments_string && (
                        <div>
                            <div className="text-[11px] text-zinc-400 mb-1">Parameters:</div>
                            <pre className="bg-[#0B0C10] rounded-lg p-2.5 text-[11px] text-zinc-300 font-mono border border-white/[0.06] whitespace-pre-wrap">
                                {(() => {
                                    try {
                                        return JSON.stringify(JSON.parse(toolCall.arguments_string), null, 2);
                                    } catch {
                                        return toolCall.arguments_string;
                                    }
                                })()}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default function MessageBubble({ message }) {
    const isUser = message.role === 'user';
    const [sendingWA, setSendingWA] = useState(false);
    const [sentWA, setSentWA] = useState(false);

    const handleSendToWhatsApp = async () => {
        const aiCfg = getAIConfig();
        let targetPhone = aiCfg.recipientPhone || localStorage.getItem("opus_whatsapp_phone") || "";

        if (!targetPhone) {
            const entered = window.prompt("Enter your phone number (with country code, e.g. 971501234567 or 5511999999999):");
            if (!entered || !entered.trim()) return;
            targetPhone = entered.replace(/\D/g, "");
            saveAIConfig({ recipientPhone: targetPhone });
            localStorage.setItem("opus_whatsapp_phone", targetPhone);
        }

        setSendingWA(true);
        try {
            await sendWhatsAppMessage({
                number: targetPhone,
                text: `💬 *OPUS Financial Assistant:*\n\n${message.content}\n\n_Sent from OPUS Finance App_`,
            });
            setSentWA(true);
            toast.success("Sent to WhatsApp successfully!");
            setTimeout(() => setSentWA(false), 3000);
        } catch (err) {
            toast.error(err.message || "Failed to send to WhatsApp. Check connection.");
        } finally {
            setSendingWA(false);
        }
    };
    
    return (
        <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
            {!isUser && (
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mt-0.5 flex-shrink-0 shadow-[0_0_15px_-3px_rgba(139,92,246,0.5)] border border-white/20">
                    <Sparkles className="h-4 w-4 text-white" />
                </div>
            )}
            <div className={cn("max-w-[85%]", isUser && "flex flex-col items-end")}>
                {message.content && (
                    <div className={cn(
                        "rounded-2xl px-4 py-3 shadow-md transition-all",
                        isUser 
                            ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border border-violet-400/20 shadow-[0_0_24px_-6px_rgba(139,92,246,0.4)]" 
                            : "bg-[#181A24]/95 border border-white/[0.1] text-zinc-100 backdrop-blur-xl"
                    )}>
                        {isUser ? (
                            <p className="text-sm leading-relaxed">{message.content}</p>
                        ) : (
                            <ReactMarkdown 
                                className="text-sm prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 text-zinc-100"
                            >
                                {message.content}
                            </ReactMarkdown>
                        )}
                    </div>
                )}
                
                {message.tool_calls?.length > 0 && (
                    <div className="space-y-1 w-full">
                        {message.tool_calls.map((toolCall, idx) => (
                            <FunctionDisplay key={idx} toolCall={toolCall} />
                        ))}
                    </div>
                )}

                {!isUser && message.content && (
                    <div className="flex items-center gap-2 mt-1.5 px-1">
                        <button
                            type="button"
                            onClick={handleSendToWhatsApp}
                            disabled={sendingWA}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-medium transition-all"
                            title="Send this response to your WhatsApp"
                        >
                            {sendingWA ? (
                                <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                            ) : sentWA ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                                <MessageCircle className="w-3 h-3 text-emerald-400" />
                            )}
                            <span>{sentWA ? "Sent to WhatsApp!" : "Send to WhatsApp"}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
