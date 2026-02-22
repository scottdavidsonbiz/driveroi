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

export interface CarouselGenerateResponse {
  postCopy: string;
  carousel: CarouselData;
}
