import { TagI } from './tag.model';
import { TaskI } from './task.model';

export interface TaskTagI {
  id?: number;
  taskId: number;
  task?: TaskI;
  tagId: number;
  tag?: TagI;
}
