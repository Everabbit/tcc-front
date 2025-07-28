import { TaskI } from './task.model';

export interface HeaderButtonI {
  button: boolean;
  label: string;
  icon: string;
  emitt: string;
}

export interface ColumnI {
  id: number;
  name: string;
  tasks: TaskI[];
}
