import { RolesEnum } from 'src/enums/roles.enum';
import { TaskI } from './task.model';
import { UserBasicI } from './user.model';

export interface CommentI {
  id?: number;
  taskId: number;
  task?: TaskI;
  authorId: number;
  author?: UserBasicI;
  authorRole?: RolesEnum;
  content: string;
  edited: boolean;
  createdAt: Date;
  updatedAt: Date;
}
