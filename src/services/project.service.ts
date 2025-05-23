import { AxiosResponse } from 'axios';
import { ProjectCreateI } from 'src/models/project.model';
import { ResponseI } from 'src/models/response.model';
import api from './api';

export default class ProjectService {
  static async create(project: ProjectCreateI): Promise<ResponseI> {
    try {
      if (!project || !project.name) {
        throw Error('Informe um projeto válido!');
      }

      const response: AxiosResponse = await api.post(`/projects/create`, project);

      if (response.status === 200) {
        return response.data;
      } else {
        throw Error(response.data.message);
      }
    } catch (err: any) {
      const response: ResponseI = {
        message: err,
        sucess: false,
      };
      return response;
    }
  }
}
