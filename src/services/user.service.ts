import type { ResponseI } from 'src/models/response.model';
import api from './api';
import { UserLoginI, UserRegisterI } from 'src/models/user.model';
import { AxiosResponse } from 'axios';
import { toBase64 } from 'src/utils/transform';

export default class UserService {
  static async register(user: UserRegisterI): Promise<ResponseI> {
    try {
      if (!user || !user.email || !user.password || !user.fullName) {
        throw Error('Informe um usuário válido!');
      }
      user.email = toBase64(user.email);
      user.password = toBase64(user.password);
      user.fullName = toBase64(user.fullName);

      const response: AxiosResponse = await api.post(`/users/register`, user);

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

  static async login(user: UserLoginI): Promise<ResponseI> {
    try {
      if (!user || !user.email || !user.password) {
        throw Error('Informe um usuário válido!');
      }

      user.email = toBase64(user.email);
      user.password = toBase64(user.password);

      const response: AxiosResponse = await api.post(`/users/login`, user);

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

  static async validateToken(): Promise<ResponseI> {
    try {
      const response: AxiosResponse = await api.get(`/users/validateToken`);

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

  static async getBasicUser(): Promise<ResponseI> {
    try {
      const response: AxiosResponse = await api.get(`/users/basicinfo`);

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
