export enum ProjectStatus {
  ACTIVE = 0,
  PLAN = 1,
  ARCHIVED = 2,
  ENDED = 3,
}

export const ProjectStatusValues = [
  { id: ProjectStatus.ACTIVE, name: 'Ativo', color: 'light-green-10' },
  { id: ProjectStatus.PLAN, name: 'Planejado', color: 'blue-grey-8' },
  { id: ProjectStatus.ARCHIVED, name: 'Arquivado', color: 'blue-grey-10' },
  { id: ProjectStatus.ENDED, name: 'Encerrado', color: 'blue-grey-10' },
];
