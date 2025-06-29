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
  },
  {
    id: VersionStatusEnum.DEVELOPMENT,
    name: 'Em desenvolvimento',
  },
  {
    id: VersionStatusEnum.TESTING,
    name: 'Em testes',
  },
  {
    id: VersionStatusEnum.STAGING,
    name: 'Preparada pro deploy',
  },
  {
    id: VersionStatusEnum.RELEASED,
    name: 'Já lançada',
  },
  {
    id: VersionStatusEnum.DEPRECATED,
    name: 'Obsoleta',
  },
  {
    id: VersionStatusEnum.ROLLED_BACK,
    name: 'Revertida',
  },
];
