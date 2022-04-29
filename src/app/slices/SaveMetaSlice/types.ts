/* --- STATE --- */
export interface SaveMetaState {
  version: number;
  timestamp: number;
  commit?: {
    hash: string;
    date: string;
  };
}
