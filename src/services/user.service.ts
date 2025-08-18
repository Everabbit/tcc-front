import type { ResponseI } from 'src/models/response.model';
import api from './api';
import {
  PasswordChangeI,
  UserI,
  UserLoginI,
  UserPreferencesI,
  UserRegisterI,
} from 'src/models/user.model';
import { AxiosResponse } from 'axios';
import { toBase64 } from 'src/utils/transform';

export default class UserService {
  static async emailRequest(email: string): Promise<ResponseI> {
    try {
      if (!email) {
        throw Error('Informe um email válido!');
      }
      email = toBase64(email);
      const response: AxiosResponse = await api.post(`/users/emailrequest`, { email });

      if (response.status === 200) {
        return response.data;
      } else {
        throw Error(response.data.message);
      }
    } catch (err: any) {
      const response: ResponseI = {
        message: err.response?.data?.message || err.message || 'Ocorreu um erro desconhecido.',
        success: false,
      };
      return response;
    }
  }

  static async emailRequestAccept(token: string): Promise<ResponseI> {
    try {
      if (!token) {
        throw Error('Informe um token válido!');
      }
      const response: AxiosResponse = await api.get(`/users/emailrequest/accept/${token}`);

      if (response.status === 200) {
        return response.data;
      } else {
        throw Error(response.data.message);
      }
    } catch (err: any) {
      const response: ResponseI = {
        message: err.response?.data?.message || err.message || 'Ocorreu um erro desconhecido.',
        success: false,
      };
      return response;
    }
  }

  static async changePasswordRequest(email: string): Promise<ResponseI> {
    try {
      if (!email) {
        throw Error('Informe um email válido!');
      }
      email = toBase64(email);
      const response: AxiosResponse = await api.post(`/users/changepasswordrequest`, { email });

      if (response.status === 200) {
        return response.data;
      } else {
        throw Error(response.data.message);
      }
    } catch (err: any) {
      const response: ResponseI = {
        message: err.response?.data?.message || err.message || 'Ocorreu um erro desconhecido.',
        success: false,
      };
      return response;
    }
  }

  static async resetPassword(password: string, token: string): Promise<ResponseI> {
    try {
      if (!password) {
        throw Error('Informe uma senha válida!');
      }
      if (!token) {
        throw Error('Informe um token válido!');
      }
      password = toBase64(password);

      const response: AxiosResponse = await api.post(`/users/changepassword/${token}`, {
        password,
      });

      if (response.status === 200) {
        return response.data;
      } else {
        throw Error(response.data.message);
      }
    } catch (err: any) {
      const response: ResponseI = {
        message: err.response?.data?.message || err.message || 'Ocorreu um erro desconhecido.',
        success: false,
      };
      return response;
    }
  }

  static async register(user: UserRegisterI): Promise<ResponseI> {
    try {
      if (!user || !user.email || !user.password || !user.fullName) {
        throw Error('Informe um usuário válido!');
      }
      user.email = toBase64(user.email);
      user.password = toBase64(user.password);
      user.fullName = toBase64(user.fullName);
      user.username = toBase64(user.username);

      const response: AxiosResponse = await api.post(`/users/register`, user);

      if (response.status === 200) {
        return response.data;
      } else {
        throw Error(response.data.message);
      }
    } catch (err: any) {
      const response: ResponseI = {
        message: err.response?.data?.message || err.message || 'Ocorreu um erro desconhecido.',
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

  static async logout(): Promise<ResponseI> {
    try {
      const response: AxiosResponse = await api.post(`/users/logout`);
      return response.data;
    } catch (err: any) {
      const response: ResponseI = {
        message: err.response?.data?.message || 'Logout realizado no cliente.',
        success: false,
      };
      return response;
    }
  }

  static async update(user: UserI): Promise<ResponseI> {
    try {
      if (!user) {
        throw Error('Informe um usuário válido!');
      }

      if (user.email) {
        user.email = toBase64(user.email);
      }
      if (user.fullName) {
        user.fullName = toBase64(user.fullName);
      }
      if (user.username) {
        user.username = toBase64(user.username);
      }

      const response: AxiosResponse = await api.put(`/users/update`, user);

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

  static async delete(): Promise<ResponseI> {
    try {
      const response: AxiosResponse = await api.delete(`/users/delete`);

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

  static async updatePassword(password: PasswordChangeI): Promise<ResponseI> {
    try {
      if (!password) {
        throw Error('Informe uma senha válida!');
      }

      password.currentPassword = toBase64(password.currentPassword);
      password.newPassword = toBase64(password.newPassword);
      password.newPasswordConfirm = toBase64(password.newPasswordConfirm);

      const response: AxiosResponse = await api.put(`/users/updatepassword`, {
        password,
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

  static async updatePreferences(preferences: UserPreferencesI): Promise<ResponseI> {
    try {
      if (!preferences) {
        throw Error('Informe preferências válidas!');
      }

      const response: AxiosResponse = await api.put(`/users/updatepreferences`, preferences);

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

  static async getPreferences(): Promise<ResponseI> {
    try {
      const response: AxiosResponse = await api.get(`/users/preferences`);

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

  static async getUserConfig(): Promise<ResponseI> {
    try {
      const response: AxiosResponse = await api.get(`/users/settings`);

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

  static async updateImage(image: FormData): Promise<ResponseI> {
    try {
      if (!image) {
        throw Error('Informe uma imagem válida!');
      }

      const response: AxiosResponse = await api.put(`/users/updateimage`, image, {
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

  static async removeImage(): Promise<ResponseI> {
    try {
      const response: AxiosResponse = await api.delete(`/users/removeimage`);

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

  static async getBasicUserList(username: string): Promise<ResponseI> {
    try {
      if (!username) {
        throw Error('Informe um nome de usuário válido!');
      }
      username = toBase64(username);
      const response: AxiosResponse = await api.get(`/users/basicinfolist/${username}`);

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

  static async getUserRole(projectId: number): Promise<ResponseI> {
    try {
      if (!projectId) {
        throw Error('Informe um ID de projeto válido!');
      }

      const response: AxiosResponse = await api.get(`/users/role/${projectId}`);

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
