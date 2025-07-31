import { TaskI } from './task.model';

export interface AttachmentI {
  id?: number;
  taskId: number;
  task?: TaskI;
  fileName: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
}
