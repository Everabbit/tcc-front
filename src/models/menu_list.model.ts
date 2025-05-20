export interface MenuBasicListI {
  id: number;
  title: string;
  link?: string;
  icon?: string;
}

export const menuBasicList: MenuBasicListI[] = [
  {
    id: 1,
    title: 'Dashoard',
    link: '/p/dashboard',
    icon: 'mdi-view-dashboard',
  },
  {
    id: 2,
    title: 'Projetos',
    link: '/p/projetos',
    icon: 'mdi-folder-multiple',
  },
  {
    id: 3,
    title: 'Minhas Tarefas',
    link: '/p/minhas_tarefas',
    icon: 'mdi-format-list-checks',
  },
];
