export type StatCard = {
  type: "stat";
  value: string;
  label: string;
};

export type InsightCard = {
  type: "insight";
  headline: string;
  body: string;
};

export type StepCard = {
  type: "step";
  number: number;
  title: string;
  description: string;
};

export type TakeawayCard = {
  type: "takeaway";
  text: string;
};

export type Card = StatCard | InsightCard | StepCard | TakeawayCard;

export interface CarouselData {
  title: string;
  subtitle?: string;
  cards: Card[];
}

export type VoiceTone = "professional" | "conversational";

export type CTAStyle = "dm" | "book" | "follow" | "none";

export interface CarouselGenerateOptions {
  idea: string;
  hook?: string;
  cta?: CTAStyle;
  ctaCustom?: string;
  voice?: VoiceTone;
}

export interface CarouselGenerateResponse {
  postCopy: string;
  carousel: CarouselData;
}

export interface HookOption {
  hook: string;
  angle: string;
}

export interface HooksGenerateResponse {
  hooks: HookOption[];
}

export interface SlideRegenerateRequest {
  carousel: CarouselData;
  postCopy: string;
  slideIndex: number;
  feedback?: string;
  voice?: VoiceTone;
}
