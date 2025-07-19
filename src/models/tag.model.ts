import { ProjectI } from './project.model';

export interface TagI {
  id?: number;
  projectId: number;
  project?: ProjectI;
  name: string;
  color?: string;
}
