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
            <div className="mt-2.5 p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 text-xs">
                <div className="flex items-center justify-between font-medium text-emerald-900 mb-1">
                    <span className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                        Recorded in App Database
                    </span>
                    <span className={cn(
                        "font-semibold font-mono",
                        isExpense ? "text-rose-600" : "text-emerald-700"
                    )}>
                        {isExpense ? "-" : "+"}${Number(args.amount || 0).toFixed(2)}
                    </span>
                </div>
                <div className="text-[11px] text-slate-600 flex items-center justify-between">
                    <span>{args.description || "Transaction"} • <strong className="text-slate-700">{args.category || "General"}</strong></span>
                    <span className="text-slate-400 font-sans">{args.payment_method || "Card"}</span>
                </div>
            </div>
        );
    }
    
    const statusConfig = {
        pending: { icon: Clock, color: 'text-slate-400', text: 'Pending' },
        running: { icon: Loader2, color: 'text-slate-500', text: 'Running...', spin: true },
        in_progress: { icon: Loader2, color: 'text-slate-500', text: 'Running...', spin: true },
        completed: isError ? 
            { icon: AlertCircle, color: 'text-red-500', text: 'Failed' } : 
            { icon: CheckCircle2, color: 'text-green-600', text: 'Success' },
        success: { icon: CheckCircle2, color: 'text-green-600', text: 'Success' },
        failed: { icon: AlertCircle, color: 'text-red-500', text: 'Failed' },
        error: { icon: AlertCircle, color: 'text-red-500', text: 'Failed' }
    }[status] || { icon: Zap, color: 'text-slate-500', text: '' };
    
    const Icon = statusConfig.icon;
    const formattedName = name.split('.').reverse().join(' ').toLowerCase();
    
    return (
        <div className="mt-2 text-xs">
            <button
                onClick={() => setExpanded(!expanded)}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all",
                    "hover:bg-slate-50",
                    expanded ? "bg-slate-50 border-slate-300" : "bg-white border-slate-200"
                )}
            >
                <Icon className={cn("h-3 w-3", statusConfig.color, statusConfig.spin && "animate-spin")} />
                <span className="text-slate-700">{formattedName}</span>
                {statusConfig.text && (
                    <span className={cn("text-slate-500", isError && "text-red-600")}>
                        • {statusConfig.text}
                    </span>
                )}
                {!statusConfig.spin && (toolCall.arguments_string || results) && (
                    <ChevronRight className={cn("h-3 w-3 text-slate-400 transition-transform ml-auto", 
                        expanded && "rotate-90")} />
                )}
            </button>
            
            {expanded && !statusConfig.spin && (
                <div className="mt-1.5 ml-3 pl-3 border-l-2 border-slate-200 space-y-2">
                    {toolCall.arguments_string && (
                        <div>
                            <div className="text-xs text-slate-500 mb-1">Parameters:</div>
                            <pre className="bg-slate-50 rounded-md p-2 text-xs text-slate-600 whitespace-pre-wrap">
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
                    {parsedResults && (
                        <div>
                            <div className="text-xs text-slate-500 mb-1">Result:</div>
                            <pre className="bg-slate-50 rounded-md p-2 text-xs text-slate-600 whitespace-pre-wrap max-h-48 overflow-auto">
                                {typeof parsedResults === 'object' ? 
                                    JSON.stringify(parsedResults, null, 2) : parsedResults}
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
                <div className="h-7 w-7 rounded-lg bg-emerald-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                </div>
            )}
            <div className={cn("max-w-[85%]", isUser && "flex flex-col items-end")}>
                {message.content && (
                    <div className={cn(
                        "rounded-2xl px-4 py-2.5 shadow-sm",
                        isUser ? "bg-emerald-600 text-white" : "bg-white border border-slate-200/80"
                    )}>
                        {isUser ? (
                            <p className="text-sm leading-relaxed">{message.content}</p>
                        ) : (
                            <ReactMarkdown 
                                className="text-sm prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
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
                            className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-emerald-700 transition-colors"
                            title="Send this response to your WhatsApp"
                        >
                            {sendingWA ? (
                                <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                            ) : sentWA ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                                <MessageCircle className="w-3 h-3 text-emerald-600" />
                            )}
                            <span>{sentWA ? "Sent to WhatsApp!" : "Send to WhatsApp"}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
