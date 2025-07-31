import { AxiosResponse } from 'axios';
import { ResponseI } from 'src/models/response.model';
import { TagI } from 'src/models/tag.model';
import api from './api';

export default class TagService {
  static async addTag(tag: TagI): Promise<ResponseI> {
    try {
      if (!tag) {
        throw Error('Informe uma etiqueta válida!');
      }

      const response: AxiosResponse = await api.post(`/tags/createtag`, tag);

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

  static async removeTag(tagId: number): Promise<ResponseI> {
    try {
      if (!tagId) {
        throw Error('Informe uma etiqueta válida!');
      }
      const response: AxiosResponse = await api.delete(`/tags/deletetag/${tagId}`);

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
  static async updateTag(tag: TagI): Promise<ResponseI> {
    try {
      if (!tag) {
        throw Error('Informe uma etiqueta válida!');
      }
      const response: AxiosResponse = await api.put(`/tags/updatetag`, tag);

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

  static async getAll(projectId: number): Promise<ResponseI> {
    try {
      if (!projectId) {
        throw Error('Informe um ID de projeto válido!');
      }
      const response: AxiosResponse = await api.get(`/tags/getall/${projectId}`);

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
