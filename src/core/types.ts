export type Timestamp = string;

export type SpecFlowProject = {
  name: string;
  slug: string;
  domain: string;
  description: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

import { ProviderKey } from "./providers.js";

export type SpecFlowConfig = {
  provider: ProviderKey | string;
  model: string;
  temperature: number;
  outputFormats: Array<"json" | "md">;
};

export type StateListItem = {
  id: string;
  title: string;
  description?: string;
  status?: string;
  source?: string;
  tags?: string[];
  aiHint?: string;
  fullQuestion?: string;
  answer?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  [key: string]: unknown;
};

export type SpecFlowState = {
  project: SpecFlowProject;
  requirements: StateListItem[];
  decisions: StateListItem[];
  assumptions: StateListItem[];
  openQuestions: StateListItem[];
  rejectedScope: StateListItem[];
  deferredScope: StateListItem[];
  aiQuestionSession?: {
    completedAt?: Timestamp;
  };
};
