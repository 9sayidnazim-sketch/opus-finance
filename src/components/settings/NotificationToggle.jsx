import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function NotificationToggle({ label, description, enabled, onChange }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
      <div className="flex-1 mr-4">
        <Label className="text-base font-medium text-slate-900 cursor-pointer">
          {label}
        </Label>
        {description && (
          <p className="text-sm text-slate-500 mt-1">
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