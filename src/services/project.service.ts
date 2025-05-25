import { AxiosResponse } from 'axios';
import { ProjectCreateI } from 'src/models/project.model';
import { ResponseI } from 'src/models/response.model';
import api from './api';

export default class ProjectService {
  static async create(project: FormData): Promise<ResponseI> {
    try {
      if (!project) {
        throw Error('Informe um projeto válido!');
      }

      const response: AxiosResponse = await api.post(`/projects/create`, project, {
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
        message: err,
        success: false,
      };
      return response;
    }
  }
}
