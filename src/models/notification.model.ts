import { NotificationType } from 'src/enums/notification_type.enum';
import { UserI } from './user.model';

export interface NotificationMetadataI {
  inviterId: number;
  inviterName: string;
  projectId?: number;
  projectName?: string;
}

export interface NotificationI {
  id?: number;
  userId: number;
  user?: UserI;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: NotificationMetadataI;
  createdAt?: Date;
  updatedAt?: Date;
  invitationToken?: string;
}
