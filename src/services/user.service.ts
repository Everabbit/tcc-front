import type { ResponseI } from 'src/models/response.model';
import api from './api';
import { UserRegisterI } from 'src/models/user.model';
import { AxiosResponse } from 'axios';

export default class UserService {
  static async register(user: UserRegisterI): Promise<ResponseI> {
    try {
      const response: AxiosResponse = await api.post(`/users/register`, user);

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
