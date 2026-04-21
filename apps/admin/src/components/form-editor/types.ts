export interface StepField {
  id: string;
  type: "text" | "nps" | "choice" | "grid";
  label: string;
  placeholder?: string;
  options?: string[];
  rows?: string[];
}

export interface FormStep {
  id: string;
  type:
    | "welcome"
    | "core"
    | "identity"
    | "success"
    | "custom"
    | "rating"
    | "textarea"
    | "attribution"
    | "informative";
  title: string;
  description?: string;
  isEnabled: boolean;
  locked?: boolean;
  config?: Record<string, unknown>;
}

export interface FormBranding {
  logoUrl?: string;
  avatarUrl?: string;
  primaryColor?: string;
  headingFont?: string;
  bodyFont?: string;
  brandColors?: string[];
}

export interface FormData {
  id: string;
  publicId: string;
  name: string;
  config: {
    steps: FormStep[];
    branding: FormBranding;
  };
}

/** Step types essential to a complete review flow. Update when adding new step types to FormStep['type']. */
export const REQUIRED_STEP_TYPES: ReadonlySet<FormStep["type"]> = new Set([
  "welcome",
  "core",
  "rating",
  "textarea",
  "identity",
  "success",
]);
