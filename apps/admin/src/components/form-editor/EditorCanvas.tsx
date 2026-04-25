import { type RefObject } from "react";
import { ChevronDown, ChevronUp, Trash2, Plus } from "lucide-react";
import { StepPreview } from "./StepPreview";
import { REQUIRED_STEP_TYPES } from "./types";
import type { FormData, FormStep } from "./types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";


interface EditorCanvasProps {
  form: FormData;
  canvasRef: RefObject<HTMLDivElement | null>;
  stepRefs: RefObject<Record<string, HTMLDivElement | null>>;
  activeStepId: string | null;
  previewMode: "desktop" | "mobile";
  selectedElement: string | null;
  onElementClick: (elementKey: string, stepId: string) => void;
  onScrollToStep: (stepId: string) => void;
  onMoveStep: (index: number, direction: "up" | "down") => void;
  onDeleteStep: (stepId: string) => void;
  onAddStep: () => void;
}

function stepTypeBadge(step: FormStep, index: number) {
  const label =
    step.type === "welcome"
      ? "Welcome"
      : step.type === "core"
        ? "Core"
        : step.type === "identity"
          ? "Identity"
          : step.type === "success"
            ? "Success"
            : step.type === "custom"
              ? "Custom"
              : step.type === "rating"
                ? "Rating"
                : step.type === "textarea"
                  ? "Textarea"
                  : step.type === "informative"
                    ? "Informative"
                    : step.type === "attribution"
                      ? "Attribution"
                      : step.type;

  return `Step ${index + 1}: ${label}`;
}

export function EditorCanvas({
  form,
  canvasRef,
  stepRefs,
  activeStepId,
  previewMode,
  selectedElement,
  onElementClick,
  onScrollToStep,
  onMoveStep,
  onDeleteStep,
  onAddStep,
}: EditorCanvasProps) {
  const activeStep = form.config.steps.find((s) => s.id === activeStepId);

  return (
    <section
      ref={canvasRef}
      className="order-first lg:order-first w-full bg-(--v3-bg2) border border-(--v3-border) rounded-2xl lg:rounded-3xl shadow-2xl h-full overflow-y-auto p-4 md:p-8 lg:p-12 background-fixed custom-scrollbar snap-y snap-mandatory"
      style={{
        scrollBehavior: "smooth",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <style>{`section::-webkit-scrollbar { display: none; }`}</style>

      {/* Sticky reorder/delete controls — hidden for locked steps */}
      {!activeStep?.locked && (
        <div className="sticky top-0 right-0 z-50 flex justify-end p-0 pointer-events-none">
          <div className="flex gap-1 bg-[#0A0A0A]/60 backdrop-blur-md p-1 rounded-bl-xl border-l border-b border-white/10 pointer-events-auto shadow-2xl overflow-hidden">
            <button
              disabled={(() => {
                const idx = form.config.steps.findIndex(
                  (s) => s.id === activeStepId,
                );
                return idx <= 0 || !!form.config.steps[idx - 1]?.locked;
              })()}
              onClick={() =>
                onMoveStep(
                  form.config.steps.findIndex((s) => s.id === activeStepId),
                  "up",
                )
              }
              className="p-2 text-[#0D9E75] hover:bg-[#0D9E75]/10 rounded-lg transition-all disabled:opacity-20"
              title="Move current step up"
            >
              <ChevronUp size={16} strokeWidth={3} />
            </button>
            <button
              disabled={(() => {
                const idx = form.config.steps.findIndex(
                  (s) => s.id === activeStepId,
                );
                return (
                  idx >= form.config.steps.length - 1 ||
                  !!form.config.steps[idx + 1]?.locked
                );
              })()}
              onClick={() =>
                onMoveStep(
                  form.config.steps.findIndex((s) => s.id === activeStepId),
                  "down",
                )
              }
              className="p-2 text-[#0D9E75] hover:bg-[#0D9E75]/10 rounded-lg transition-all disabled:opacity-20"
              title="Move current step down"
            >
              <ChevronDown size={16} strokeWidth={3} />
            </button>
            <div className="w-px bg-white/10 mx-0.5" />
            <button
              onClick={() => activeStepId && onDeleteStep(activeStepId)}
              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              title="Delete this step"
            >
              <Trash2 size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center">
        {form.config.steps.map((step, index) => (
          <div
            key={step.id}
            ref={(el) => {
              if (stepRefs.current) stepRefs.current[step.id] = el;
            }}
            data-step-id={step.id}
            className="flex flex-col items-center w-full min-h-125 md:min-h-[calc(100vh-160px)] snap-center justify-center py-10 md:py-12 relative"
          >
            {/* Step card */}
            <div
              onClick={() => onScrollToStep(step.id)}
              className={`
                transition-all duration-500 shadow-2xl relative bg-white overflow-hidden rounded-2xl md:rounded-3xl cursor-pointer
                ${previewMode === "mobile" ? "w-full max-w-96 h-fit max-h-[calc(100vh-200px)]" : "w-full max-w-200 h-fit max-h-[85%]"}
                ${
                  activeStepId === step.id
                    ? "ring-4 ring-[#0D9E75] ring-offset-4 ring-offset-[#0A0A0A]"
                    : "opacity-40 hover:opacity-100 hover:ring-2 hover:ring-white/20 scale-95 lg:scale-95"
                }
                ${!step.isEnabled ? "grayscale-[1]" : ""}
              `}
            >
              {/* Step badge */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                <div className="bg-[#0A0A0A]/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/10">
                  {stepTypeBadge(step, index)}
                </div>
                {(() => {
                  const isRequired = REQUIRED_STEP_TYPES.has(step.type);
                  const isLocked = !!step.locked;

                  const badgeText = isRequired ? "● Required" : "○ Optional";
                  const badgeClass = isRequired
                    ? "bg-[#0D9E75]/10 text-[#0D9E75]"
                    : "bg-white/5 text-white/40";

                  if (!isRequired && !isLocked) {
                    return (
                      <div
                        className={`backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${badgeClass}`}
                      >
                        {badgeText}
                      </div>
                    );
                  }

                  const tooltipText =
                    isRequired && isLocked
                      ? "This step cannot be removed or disabled."
                      : isRequired
                        ? "This step cannot be disabled."
                        : "This step cannot be removed.";

                  return (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest cursor-help ${badgeClass}`}
                        >
                          {badgeText}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">{tooltipText}</TooltipContent>
                    </Tooltip>
                  );
                })()}
              </div>

              <StepPreview
                step={step}
                branding={form.config.branding}
                previewMode={previewMode}
                activeStepId={activeStepId}
                selectedElement={selectedElement}
                onElementClick={onElementClick}
              />
            </div>

            {/* Flow arrow */}
            {index < form.config.steps.length - 1 && (
              <div className="h-20 flex items-center justify-center text-white/20 animate-bounce mt-6">
                <ChevronDown size={32} strokeWidth={3} />
              </div>
            )}

            {/* Add step button — appears before identity/attribution */}
            {(form.config.steps[index + 1]?.type === "identity" ||
              form.config.steps[index + 1]?.type === "attribution") && (
              <div className="flex items-center justify-center py-2 w-full">
                <button
                  className="flex flex-col items-center gap-4 group"
                  onClick={onAddStep}
                >
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-dashed border-white/20 flex items-center justify-center group-hover:bg-[#0D9E75]/10 group-hover:border-[#0D9E75] transition-all">
                    <Plus
                      size={24}
                      className="text-white/40 group-hover:text-[#0D9E75]"
                    />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white/60">
                    Add a step
                  </span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
