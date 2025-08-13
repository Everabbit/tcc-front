import { AxiosResponse } from 'axios';
import { ResponseI } from 'src/models/response.model';
import api from './api';
import { TaskStatusEnum } from 'src/enums/status.enum';
import { CommentI } from 'src/models/comment.model';

export default class TaskService {
  static async create(task: FormData, projectId: number): Promise<ResponseI> {
    try {
      if (!task) {
        throw Error('Informe uma tarefa válida!');
      }

      if (!projectId) {
        throw Error('Informe um ID de projeto válido!');
      }

      const response: AxiosResponse = await api.post(`/tasks/create/${projectId}`, task, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        return response.data;
      } else {
        throw Error(response.data.message);
      }
    } catch (err: any) {
      const response: ResponseI = {
        message: err.response.data.message || err,
        success: false,
      };
      return response;
    }
  }

  static async update(taskId: number, task: FormData, projectId: number): Promise<ResponseI> {
    try {
      if (!taskId) {
        throw Error('Informe um ID de tarefa válido!');
      }
      if (!task) {
        throw Error('Informe uma tarefa válida!');
      }

      if (!projectId) {
        throw Error('Informe um ID de projeto válido!');
      }

      const response: AxiosResponse = await api.put(`/tasks/update/${projectId}/${taskId}`, task, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        return response.data;
      } else {
        throw Error(response.data.message);
      }
    } catch (err: any) {
      const response: ResponseI = {
        message: err.response.data.message || err,
        success: false,
      };
      return response;
    }
  }

  static async delete(taskId: number, projectId: number): Promise<ResponseI> {
    try {
      if (!taskId) {
        throw Error('Informe um ID de tarefa válido!');
      }

      if (!projectId) {
        throw Error('Informe um ID de projeto válido!');
      }

      const response: AxiosResponse = await api.delete(`/tasks/delete/${projectId}/${taskId}`);

      if (response.status === 200) {
        return response.data;
      } else {
        throw Error(response.data.message);
      }
    } catch (err: any) {
      const response: ResponseI = {
        message: err.response.data.message || err,
        success: false,
      };
      return response;
    }
  }

  static async getAll(versionId: number | null = null): Promise<ResponseI> {
    try {
      const response: AxiosResponse = await api.get(`/tasks/getall/${versionId ? versionId : '0'}`);

      if (response.status === 200) {
        return response.data;
      } else {
        throw Error(response.data.message);
      }
    } catch (err: any) {
      const response: ResponseI = {
        message: err.response.data.message || err,
        success: false,
      };
      return response;
    }
  }

  static async updateStatus(taskId: number, status: TaskStatusEnum): Promise<ResponseI> {
    try {
      if (!taskId) {
        throw Error('Informe um ID de tarefa válido!');
      }
      if (status === undefined || status === null) {
        throw Error('Informe um status válido!');
      }

      const response: AxiosResponse = await api.put(`/tasks/updatestatus/${taskId}`, {
        status,
      });

      if (response.status === 200) {
        return response.data;
      } else {
        throw Error(response.data.message);
      }
    } catch (err: any) {
      const response: ResponseI = {
        message: err.response.data.message || err,
        success: false,
      };
      return response;
    }
  }

  static async getOne(taskId: number): Promise<ResponseI> {
    try {
      if (!taskId) {
        throw Error('Informe um ID de tarefa válido!');
      }

      const response: AxiosResponse = await api.get(`/tasks/get/${taskId}`);

      if (response.status === 200) {
        return response.data;
      } else {
        throw Error(response.data.message);
      }
    } catch (err: any) {
      const response: ResponseI = {
        message: err.response.data.message || err,
        success: false,
      };
      return response;
    }
  }
  static async deleteAttachment(attachmentId: number, projectId: number): Promise<ResponseI> {
    try {
      if (!attachmentId) {
        throw Error('Informe um ID de anexo válido!');
      }
      if (!projectId) {
        throw Error('Informe um ID de projeto válido!');
      }

      const response: AxiosResponse = await api.delete(
        `/tasks/removeattachment/${projectId}/${attachmentId}`,
      );

      if (response.status === 200) {
        return response.data;
      } else {
        throw Error(response.data.message);
      }
    } catch (err: any) {
      const response: ResponseI = {
        message: err.response.data.message || err,
        success: false,
      };
      return response;
    }
  }
}
