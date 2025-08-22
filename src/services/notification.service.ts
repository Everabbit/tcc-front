import { AxiosResponse } from 'axios';
import { ResponseI } from 'src/models/response.model';
import api from './api';

export default class NotificationService {
  static async getAll(): Promise<ResponseI> {
    try {
      const response: AxiosResponse = await api.get(`/notifications`);

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

  static async read(notificationId: number): Promise<ResponseI> {
    try {
      if (!notificationId) {
        throw Error('Informe uma notificação válida!');
      }
      const response: AxiosResponse = await api.put(`/notifications/read/${notificationId}`);

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

  static async readAll(): Promise<ResponseI> {
    try {
      const response: AxiosResponse = await api.put(`/notifications/readall`);

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
