export interface ConductorRequest {
  id?: number;
  command: string;
  arguments?: object;
  options?: object;
  request: object;
}

export interface ConductorResponse {
  id: number;
  completed?: boolean;
  error?: any;
  result?: object;
}