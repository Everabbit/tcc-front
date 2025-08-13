import { AxiosResponse } from 'axios';
import { CommentI } from 'src/models/comment.model';
import { ResponseI } from 'src/models/response.model';
import api from './api';

export default class CommentService {
  static async create(comment: CommentI): Promise<ResponseI> {
    try {
      if (!comment) {
        throw Error('Informe um comentário válido!');
      }

      const response: AxiosResponse = await api.post(`/comments/addcomment`, comment);

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

  static async delete(commentId: number): Promise<ResponseI> {
    try {
      if (!commentId) {
        throw Error('Informe um ID de comentário válido!');
      }

      const response: AxiosResponse = await api.delete(`/comments/removecomment/${commentId}`);

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

  static async update(comment: CommentI): Promise<ResponseI> {
    try {
      if (!comment || !comment.id) {
        throw Error('Informe um comentário válido com ID!');
      }

      const response: AxiosResponse = await api.put(`/comments/updatecomment`, comment);

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
