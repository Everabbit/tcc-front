import { VersionStatusEnum } from 'src/enums/status.enum';
import { ProjectI } from './project.model';

export interface VersionI {
  id?: number;
  projectId: number;
  project: ProjectI;
  name: string;
  description?: string;
  status: VersionStatusEnum;
  startDate: Date;
  endDate?: Date;
  githubBranch?: string;
}

export interface VersionCreateI {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: VersionStatusEnum;
  projectId: number;
}
