import { PriorityEnum } from 'src/enums/task_priority.enum';
import { UserI } from './user.model';
import { VersionI } from './version.model';
import { TaskStatusEnum } from 'src/enums/status.enum';

export interface TaskI {
  id?: number;
  versionId: number;
  version?: VersionI;
  assigneeId?: number;
  assignee?: UserI;
  parentTaskId?: number;
  parentTask?: TaskI;
  title: string;
  description?: string;
  priority: PriorityEnum;
  status: TaskStatusEnum;
  deadline?: string;
  blockReason?: string;
}
