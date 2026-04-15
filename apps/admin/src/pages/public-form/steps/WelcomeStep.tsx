import { ArrowRight } from "lucide-react";
import type { FormStep } from "../types";

interface WelcomeStepProps {
  step: FormStep;
  primaryColor: string;
  appliedHeadingFont: string;
  onNext: () => void;
}

export function WelcomeStep({
  step,
  primaryColor,
  appliedHeadingFont,
  onNext,
}: WelcomeStepProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 w-full flex flex-col items-center">
      <h1
        className="text-2xl font-black tracking-tighter text-black mb-4"
        style={{ fontFamily: appliedHeadingFont, color: "#000000" }}
      >
        {step.title}
      </h1>
      <p className="text-gray-600 mb-22 text-base leading-relaxed max-w-md bg-red-300">
        {step.description}
      </p>
      <button
        onClick={onNext}
        style={{ backgroundColor: primaryColor }}
        className="w-full py-3 rounded-xl text-white font-bold text-sm shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        {(step.config as Record<string, string | boolean>)?.buttonText ||
          "Start"}{" "}
        <ArrowRight size={18} />
      </button>
    </div>
  );
}
