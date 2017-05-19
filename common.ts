export type JsonValue = boolean | number | string | JsonObject | JsonArray;
export interface JsonArray extends Array<JsonValue> {}
export interface JsonObject {
  [key: string]: JsonValue;
}

export interface ConductorRequest extends JsonObject {
  id?: number;
  command: string;
  arguments?: JsonObject;
  options?: JsonObject;
  request: JsonObject;
}

export interface ConductorResponse extends JsonObject {
  id: number;
  completed?: boolean;
  error?: JsonObject;
  result?: JsonValue;
}