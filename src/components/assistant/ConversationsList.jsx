import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function ConversationsList({ conversations, selectedId, onSelect, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm">
        No conversations yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conv) => (
        <Button
          key={conv.id}
          variant="ghost"
          className={cn(
            "w-full justify-start h-auto py-3 px-3",
            selectedId === conv.id && "bg-accent hover:bg-violet-100"
          )}
          onClick={() => onSelect(conv)}
        >
          <div className="flex items-start gap-3 w-full">
            <MessageCircle className={cn(
              "w-4 h-4 mt-0.5 flex-shrink-0",
              selectedId === conv.id ? "text-primary" : "text-slate-400"
            )} />
            <div className="flex-1 text-left min-w-0">
              <p className={cn(
                "text-sm font-medium truncate",
                selectedId === conv.id ? "text-foreground" : "text-slate-900"
              )}>
                {conv.metadata?.name || "Conversation"}
              </p>
              <p className="text-xs text-slate-500">
                {format(new Date(conv.created_date), "MMM d, HH:mm", { locale: enUS })}
              </p>
            </div>
          </div>
        </Button>
      ))}
    </div>
  );
}