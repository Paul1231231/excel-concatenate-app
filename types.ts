export interface ProcessedSheet {
  name: string;
  instructions: any[][];
  header: any[];
  data: any[][];
}

export enum AppMode {
  CONCATENATE = 'CONCATENATE',
  SPLIT = 'SPLIT',
}

export interface FileWithId {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'done' | 'error';
}
