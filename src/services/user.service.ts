import type { ResponseI } from 'src/models/response.model';
import api from './api';
import { UserRegisterI } from 'src/models/user.model';
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
        sucess: false,
      };
      return response;
    }
  }
}
