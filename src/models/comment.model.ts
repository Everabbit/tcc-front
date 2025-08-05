import { TaskI } from './task.model';
import { UserBasicI } from './user.model';

export interface CommentI {
  id?: number;
  taskId: number;
  task?: TaskI;
  authorId: number;
  author?: UserBasicI;
  content: string;
  edited: boolean;
  createdAt: Date;
  updatedAt: Date;
}
