import { TaskI } from './task.model';
import { UserI } from './user.model';

export interface CommentI {
  id?: number;
  taskId: number;
  task?: TaskI;
  authorId: number;
  author?: UserI;
  content: string;
  edited: boolean;
  createdAt: Date;
  updatedAt: Date;
}
