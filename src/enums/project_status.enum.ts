export enum ProjectStatus {
  UNACTIVE = 0,
  ACTIVE = 1,
  ARCHIVED = 2,
}

export const ProjectStatusValues = [
  { id: ProjectStatus.UNACTIVE, name: 'Inativo', color: 'red' },
  { id: ProjectStatus.ACTIVE, name: 'Ativo', color: 'light-green-10' },
  { id: ProjectStatus.ARCHIVED, name: 'Arquivado', color: 'blue-grey-10' },
];
