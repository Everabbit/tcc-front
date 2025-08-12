import { RolesEnum } from 'src/enums/roles.enum';
import { TaskI } from './task.model';

export interface HeaderButtonI {
  button: boolean;
  buttonPermission: RolesEnum;
  label: string;
  icon: string;
  emitt: string;
}

export interface ColumnI {
  id: number;
  name: string;
  tasks: TaskI[];
}
