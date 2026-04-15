import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import type { FormStep } from "../types";

interface AttributionStepProps {
  step: FormStep;
  primaryColor: string;
  appliedHeadingFont: string;
  authorName: string;
  authorEmail: string;
  authorTitle: string;
  authorUrl: string;
  submitting: boolean;
  setAuthorName: (name: string) => void;
  setAuthorEmail: (email: string) => void;
  setAuthorTitle: (title: string) => void;
  setAuthorUrl: (url: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function AttributionStep({
  step,
  primaryColor,
  appliedHeadingFont,
  authorName,
  authorEmail,
  authorTitle,
  authorUrl,
  submitting,
  setAuthorName,
  setAuthorEmail,
  setAuthorTitle,
  setAuthorUrl,
  onNext,
  onBack,
}: AttributionStepProps) {
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

      <div className="w-full space-y-3 mb-6">
        <div className="flex flex-col gap-3">
          <div className="w-full h-24 rounded-xl bg-gray-50 border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-1.5 text-gray-500 hover:bg-gray-100 hover:border-gray-200 transition-all cursor-pointer group">
            <Plus
              size={24}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="text-xs font-black uppercase tracking-widest">
              Add a photo
            </span>
          </div>

          <input
            required
            type="text"
            placeholder="Your full name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-gray-100 focus:border-gray-100 outline-none transition-all text-sm text-black placeholder:text-gray-400"
          />
        </div>

        {(step.config as Record<string, string | boolean>)?.collectEmail !==
          false && (
          <input
            required
            type="email"
            placeholder="votre@email.com"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-gray-100 focus:border-gray-100 outline-none transition-all text-sm text-black placeholder:text-gray-400"
          />
        )}

        {(step.config as Record<string, string | boolean>)?.collectCompany && (
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Your company"
              value={authorTitle}
              onChange={(e) => setAuthorTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-gray-100 focus:border-gray-100 outline-none transition-all text-sm text-black placeholder:text-gray-400"
            />
            <input
              type="url"
              placeholder="Website"
              value={authorUrl}
              onChange={(e) => setAuthorUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-gray-100 focus:border-gray-100 outline-none transition-all text-sm text-black placeholder:text-gray-400"
            />
          </div>
        )}
      </div>

      <div className="flex gap-3 w-full">
        <button
          onClick={onBack}
          className="px-5 py-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700 transition-all font-bold"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          disabled={!authorName || submitting}
          onClick={onNext}
          style={{ backgroundColor: authorName ? primaryColor : "#E5E7EB" }}
          className="flex-1 py-3 rounded-xl text-white font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            (step.config as Record<string, string | boolean>)?.buttonText ||
            "Finish"
          )}
        </button>
      </div>
    </div>
  );
}
