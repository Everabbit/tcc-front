export enum ProjectStatus {
  PLAN = 1,
  ACTIVE = 2,
  ARCHIVED = 3,
  ENDED = 4,
}

export const ProjectStatusValues = [
  //refazer na ordem certa e com as cores certas
  { id: ProjectStatus.PLAN, name: 'Planejado', color: 'blue-grey-8' },
  { id: ProjectStatus.ACTIVE, name: 'Ativo', color: 'light-green-10' },
  { id: ProjectStatus.ENDED, name: 'Encerrado', color: 'red-10' },
  { id: ProjectStatus.ARCHIVED, name: 'Arquivado', color: 'grey-8' },
];
