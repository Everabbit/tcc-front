import { TaskStatusEnum } from "src/enums/status.enum";

export interface TaskColumnI {
    id: number,
    projectId: number,
    name: string,
    color: string,
    type: TaskStatusEnum,
}