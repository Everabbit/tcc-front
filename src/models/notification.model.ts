import { NotificationType } from 'src/enums/notification_type.enum';
import { UserI } from './user.model';

export interface NotificationI {
  id?: number;
  userId: number;
  user?: UserI;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: object;
  createdAt?: Date;
  updatedAt?: Date;
}
