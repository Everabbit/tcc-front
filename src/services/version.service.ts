import { AxiosResponse } from 'axios';
import { ResponseI } from 'src/models/response.model';
import api from './api';

export default class VersionService {
  static async create(version: FormData): Promise<ResponseI> {
    try {
      if (!version) {
        throw Error('Informe uma versão válida!');
      }

      const response: AxiosResponse = await api.post(`/versions/create`, version);

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
