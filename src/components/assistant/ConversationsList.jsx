import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function ConversationsList({ conversations, selectedId, onSelect, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full bg-white/[0.04] rounded-xl" />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500 text-xs">
        No conversation sessions yet
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {conversations.map((conv) => {
        const isSelected = selectedId === conv.id;
        const dateStr = conv.created_date 
          ? format(new Date(conv.created_date), "MMM d, HH:mm", { locale: enUS })
          : "Recent";

        return (
          <button
            key={conv.id}
            type="button"
            onClick={() => onSelect(conv)}
            className={cn(
              "w-full text-left p-2.5 rounded-xl transition-all duration-200 border flex items-center gap-2.5 group",
              isSelected
                ? "bg-violet-500/15 border-violet-500/30 text-white shadow-[0_0_15px_-5px_rgba(139,92,246,0.4)]"
                : "bg-white/[0.02] border-transparent hover:bg-white/[0.05] hover:border-white/[0.06] text-zinc-400 hover:text-white"
            )}
          >
            <div className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
              isSelected ? "bg-violet-500/25 text-violet-300" : "bg-white/[0.04] text-zinc-500 group-hover:text-zinc-300"
            )}>
              <MessageCircle className="w-3.5 h-3.5" />
            </div>

            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-xs font-semibold truncate tracking-tight",
                isSelected ? "text-white" : "text-zinc-300 group-hover:text-white"
              )}>
                {conv.metadata?.name || "Conversation"}
              </p>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                {dateStr}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}