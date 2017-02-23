export interface ServiceQuery {
  agentName: string;
  id: number;
  start?: number;
  end?: number;
  duration?: number;
  minimalDuration: number;
};
