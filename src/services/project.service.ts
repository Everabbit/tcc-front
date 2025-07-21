import { AxiosResponse } from 'axios';
import { ProjectCreateI } from 'src/models/project.model';
import { ResponseI } from 'src/models/response.model';
import api from './api';
import { TagI } from 'src/models/tag.model';

export default class ProjectService {
  static async create(project: FormData): Promise<ResponseI> {
    try {
      if (!project) {
        throw Error('Informe um projeto válido!');
      }

      const response: AxiosResponse = await api.post(`/projects/create`, project, {
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

  static async update(id: string, project: FormData): Promise<ResponseI> {
    try {
      if (!id) {
        throw Error('Informe um id válido!');
      }
      if (!project) {
        throw Error('Informe um projeto válido!');
      }

      const response: AxiosResponse = await api.put(`/projects/update/${id}`, project, {
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

  static async delete(id: string): Promise<ResponseI> {
    try {
      if (!id) {
        throw Error('Informe um id válido!');
      }

      const response: AxiosResponse = await api.delete(`/projects/remove/${id}`);

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

  static async getAll(): Promise<ResponseI> {
    try {
      const response: AxiosResponse = await api.get(`/projects/list`);

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

  static async getOne(id: string): Promise<ResponseI> {
    try {
      if (!id) {
        throw Error('Informe um id válido!');
      }

      const response: AxiosResponse = await api.get(`/projects/${id}`);

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

  static async addMembers(id: string, members: FormData): Promise<ResponseI> {
    try {
      if (!id) {
        throw Error('Informe um id válido!');
      }

      if (!members) {
        throw Error('Informe membros válidos!');
      }

      const response: AxiosResponse = await api.post(`/projects/addusers/${id}`, members);

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

  static async removeMember(id: string, memberId: number): Promise<ResponseI> {
    try {
      if (!id) {
        throw Error('Informe um id válido!');
      }

      if (!memberId) {
        throw Error('Informe membros válidos!');
      }
      console.log(`/projects/removeuser/${id}/${memberId}`);
      const response: AxiosResponse = await api.delete(`/projects/removeuser/${id}/${memberId}`);

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

  static async addTag(tag: TagI): Promise<ResponseI> {
    try {
      if (!tag) {
        throw Error('Informe uma etiqueta válida!');
      }

      const response: AxiosResponse = await api.post(`/projects/createtag`, tag);

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
      const response: AxiosResponse = await api.delete(`/projects/deletetag/${tagId}`);

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
      const response: AxiosResponse = await api.put(`/projects/updatetag`, tag);

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
