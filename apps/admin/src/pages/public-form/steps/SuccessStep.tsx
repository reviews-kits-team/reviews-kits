import { CheckCircle } from "lucide-react";
import type { FormStep } from "../types";

interface SuccessStepProps {
  step: FormStep;
  primaryColor: string;
  appliedHeadingFont: string;
}

export function SuccessStep({
  step,
  primaryColor,
  appliedHeadingFont,
}: SuccessStepProps) {
  return (
    <div className="animate-in zoom-in-95 duration-1000 w-full flex flex-col items-center">
      <div
        style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce"
      >
        <CheckCircle size={40} />
      </div>
      <h1
        className="text-2xl font-black tracking-tighter text-black mb-4"
        style={{ fontFamily: appliedHeadingFont, color: "#000000" }}
      >
        {step.title}
      </h1>
      <p className="text-gray-600 text-base leading-relaxed max-w-md">
        {step.description}
      </p>
    </div>
  );
}
