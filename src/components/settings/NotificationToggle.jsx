import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function NotificationToggle({ label, description, enabled, onChange }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors">
      <div className="flex-1 mr-4">
        <Label className="text-sm font-semibold text-white cursor-pointer tracking-tight">
          {label}
        </Label>
        {description && (
          <p className="text-xs text-zinc-400 mt-0.5">
            {description}
          </p>
        )}
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={onChange}
      />
    </div>
  );
}