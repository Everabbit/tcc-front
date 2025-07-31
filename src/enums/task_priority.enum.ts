export enum PriorityEnum {
  LOW = 0, // Baixa prioridade
  MEDIUM = 1, // Prioridade média
  HIGH = 2, // Alta prioridade
  CRITICAL = 3, // Crítica
}

export const PriorityValues = [
  {
    id: PriorityEnum.LOW,
    name: 'Baixa',
    color: 'light-green-6',
  },
  {
    id: PriorityEnum.MEDIUM,
    name: 'Média',
    color: 'amber-8',
  },
  {
    id: PriorityEnum.HIGH,
    name: 'Alta',
    color: 'orange-9',
  },
  {
    id: PriorityEnum.CRITICAL,
    name: 'Crítica',
    color: 'red-10',
  },
];
