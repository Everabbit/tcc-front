import { TaskI } from './task.model';
import { UserI } from './user.model';

export interface TaskHistoryI {
  id?: number;
  taskId: number;
  task?: TaskI;
  field: string;
  oldValue: string;
  newValue: string;
  changedAt: Date;
  changedBy: number;
  user?: UserI;
}
