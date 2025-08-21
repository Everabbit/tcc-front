import { AxiosResponse } from 'axios';
import { ResponseI } from 'src/models/response.model';
import api from './api';

export default class NotificationService {
  static async getAll(): Promise<ResponseI> {
    try {
      const response: AxiosResponse = await api.get(`/notifications/list`);

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
