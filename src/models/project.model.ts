import { ProjectStatus } from 'src/enums/project_status.enum';
import { RolesEnum } from 'src/enums/roles.enum';
import { UserI } from './user.model';
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
  userId: number;
  user?: UserI;
  projectId: number;
  project?: ProjectI;
  role: RolesEnum;
  invitedAt: Date;
  acceptedAt?: Date | null;
}

export interface ProjectCreateI {
  name: string;
  description?: string;
  deadline?: string;
  members?: ProjectMemberI[];
}

export interface ProjectMemberI {
  id?: number;
  username?: string;
  image?: string;
  initials?: string;
  role?: RolesEnum;
}
