import type { ResponseI } from 'src/models/response.model';

export default class UserService {
  public async register(): Promise<ResponseI> {
    try {
      const response: ResponseI = {
        message: 'aaa',
        sucess: true,
      };
      return response;
    } catch (err: any) {
      const response: ResponseI = {
        message: err,
        sucess: false,
      };
      return response;
    }
  }
}
