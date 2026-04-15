import { ArrowRight, ArrowLeft } from "lucide-react";
import type { FormStep } from "../types";

interface TextareaStepProps {
  step: FormStep;
  primaryColor: string;
  appliedHeadingFont: string;
  content: string;
  setContent: (content: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function TextareaStep({
  step,
  primaryColor,
  appliedHeadingFont,
  content,
  setContent,
  onNext,
  onBack,
}: TextareaStepProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 w-full flex flex-col items-center">
      <h1
        className="text-2xl font-black tracking-tighter text-black mb-4"
        style={{ fontFamily: appliedHeadingFont, color: "#000000" }}
      >
        {step.title}
      </h1>
      <p className="text-gray-600 mb-6 text-base leading-relaxed">
        {step.description}
      </p>

      <textarea
        autoFocus
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={
          ((step.config as Record<string, string | boolean>)
            ?.placeholder as string) || "Type your testimonial here..."
        }
        className="w-full h-36 p-4 rounded-xl border-2 border-gray-100 bg-gray-50 mb-6 focus:ring-4 focus:ring-gray-100 focus:border-gray-200 outline-none transition-all text-black text-sm resize-none placeholder:text-gray-400"
      />

      <div className="flex gap-3 w-full">
        <button
          onClick={onBack}
          className="px-5 py-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700 transition-all font-bold"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          disabled={content.length < 5}
          onClick={onNext}
          style={{
            backgroundColor: content.length >= 5 ? primaryColor : "#E5E7EB",
          }}
          className="flex-1 py-3 rounded-xl text-white font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {(step.config as Record<string, string | boolean>)?.buttonText ||
            "Next"}{" "}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
