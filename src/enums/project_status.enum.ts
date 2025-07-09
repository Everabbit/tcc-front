export enum ProjectStatus {
  UNACTIVE = 0,
  ACTIVE = 1,
  ARCHIVED = 2,
}

export const ProjectStatusValues = [
  { id: ProjectStatus.UNACTIVE, name: 'Inativo' },
  { id: ProjectStatus.ACTIVE, name: 'Ativo' },
  { id: ProjectStatus.ARCHIVED, name: 'Arquivado' },
];
