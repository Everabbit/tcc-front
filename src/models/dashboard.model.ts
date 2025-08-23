import { NotificationI } from './notification.model';
import { ProjectI } from './project.model';

export interface DashboardI {
  stats: DashboardStatI[];
  projects: ProjectI[];
  notifications: NotificationI[];
}

export interface DashboardStatI {
  title: string;
  value: string;
  icon: string;
  color: string;
  link: string;
}
