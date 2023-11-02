export interface ILogger {
  debug: (s: string) => void;
  info: (s: string) => void;
  error: (s: string) => void;
}
