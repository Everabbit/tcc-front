import { ProjectStatus } from 'src/enums/project_status.enum';
import { RolesEnum } from 'src/enums/roles.enum';
import { UserBasicI, UserI } from './user.model';
import { VersionI } from './version.model';
import { TagI } from './tag.model';

export interface ProjectI {
  id?: number;
  creatorId: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  banner?: string;
  deadline?: Date | null;
  progress?: number;
  participation?: ProjectParticipationI[];
  createdAt?: Date;
  updatedAt?: Date;
  versions?: VersionI[];
  tags?: TagI[];
}

export interface ProjectParticipationI {
  id?: number;
  userId?: number;
  user?: UserBasicI;
  projectId?: number;
  project?: ProjectI;
  role: RolesEnum;
  invitedAt?: Date;
  accepted?: boolean;
  acceptedAt?: Date | null;
}
