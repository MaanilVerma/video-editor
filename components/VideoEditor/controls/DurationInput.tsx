import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface DurationInputProps {
  duration: number;
  onChange: (duration: number) => void;
  maxDuration?: number;
}

export function DurationInput({
  duration,
  onChange,
  maxDuration = 30,
}: DurationInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <Slider
          value={[duration]}
          min={1}
          max={maxDuration}
          step={0.5}
          onValueChange={([value]) => onChange(value)}
          className="flex-1"
        />
        <Input
          type="number"
          value={duration}
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            if (!isNaN(value)) {
              onChange(Math.min(Math.max(value, 1), maxDuration));
            }
          }}
          className="w-20"
          min={1}
          max={maxDuration}
          step={0.5}
        />
      </div>
    </div>
  );
}
