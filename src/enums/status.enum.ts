export enum TaskStatusEnum {
  PENDING = 0, // Aguardando início
  IN_PROGRESS = 1, // Em andamento
  BLOCKED = 2, // Travada por algum motivo
  REVIEW = 3, // Em revisão
  DONE = 4, // Finalizada
  CANCELED = 5, // Cancelada
}

export enum VersionStatusEnum {
  DRAFT = 0, // Rascunho
  DEVELOPMENT = 1, // Em desenvolvimento
  TESTING = 2, // Em testes
  STAGING = 3, // Preparada pro deploy
  RELEASED = 4, // Já lançada
  DEPRECATED = 5, // Obsoleta
  ROLLED_BACK = 6, // Revertida por bugão
}

export const VersionStatus = [
  {
    id: VersionStatusEnum.DRAFT,
    name: 'Rascunho',
    color: 'grey-6',
  },
  {
    id: VersionStatusEnum.DEVELOPMENT,
    name: 'Em desenvolvimento',
    color: 'blue',
  },
  {
    id: VersionStatusEnum.TESTING,
    name: 'Em testes',
    color: 'amber',
  },
  {
    id: VersionStatusEnum.STAGING,
    name: 'Preparada pro deploy',
    color: 'light-green',
  },
  {
    id: VersionStatusEnum.RELEASED,
    name: 'Já lançada',
    color: 'positive',
  },
  {
    id: VersionStatusEnum.DEPRECATED,
    name: 'Obsoleta',
    color: 'grey-8',
  },
  {
    id: VersionStatusEnum.ROLLED_BACK,
    name: 'Revertida',
    color: 'negative',
  },
];
