import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export default function NotificationThreshold({ 
  label, 
  description, 
  value, 
  onChange, 
  min, 
  max, 
  step,
  suffix = ""
}) {
  return (
    <div className="pl-4 sm:pl-8 space-y-2.5 p-3 rounded-xl bg-white/[0.015] border border-white/[0.03]">
      <div className="flex items-baseline justify-between">
        <Label className="text-xs font-semibold text-zinc-300">
          {label}
        </Label>
        <span className="text-sm font-bold text-violet-400 tabular-numbers px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20">
          {value}{suffix}
        </span>
      </div>
      
      <Slider
        value={[value]}
        onValueChange={(vals) => onChange(vals[0])}
        min={min}
        max={max}
        step={step}
        className="w-full py-1"
      />
      
      {description && (
        <p className="text-[11px] text-zinc-400">
          {description}
        </p>
      )}
    </div>
  );
}