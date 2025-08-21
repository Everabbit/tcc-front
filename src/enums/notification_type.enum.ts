export enum NotificationType {
  PROJECT_INVITATION = 'PROJECT_INVITATION',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  COMMENT_MENTION = 'COMMENT_MENTION',
  PROJECT_UPDATE = 'PROJECT_UPDATE',
  INVITATION_ACCEPTED = 'INVITATION_ACCEPTED',
}

export const NOTIFICATION_TYPES = [
  {
    id: NotificationType.PROJECT_INVITATION,
    name: 'Convite de Projeto',
    icon: 'mdi-account-plus',
    color: 'primary',
  },
  {
    id: NotificationType.TASK_ASSIGNED,
    name: 'Tarefa Atribuída',
    icon: 'mdi-check-circle',
    color: 'positive',
  },
  {
    id: NotificationType.COMMENT_MENTION,
    name: 'Menção em Comentário',
    icon: 'mdi-at',
    color: 'info',
  },
  {
    id: NotificationType.PROJECT_UPDATE,
    name: 'Atualização de Projeto',
    icon: 'mdi-update',
    color: 'warning',
  },
  {
    id: NotificationType.INVITATION_ACCEPTED,
    name: 'Convite Aceito',
    icon: 'mdi-handshake',
    color: 'accent',
  },
];
