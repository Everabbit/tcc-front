import { AxiosResponse } from 'axios';
import { ProjectParticipationI } from 'src/models/project.model';
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

  static async update(id: number, project: FormData): Promise<ResponseI> {
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

  static async delete(id: number): Promise<ResponseI> {
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

  static async getOne(id: number): Promise<ResponseI> {
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

  static async addMember(id: number, member: ProjectParticipationI): Promise<ResponseI> {
    try {
      if (!id) {
        throw Error('Informe um id válido!');
      }

      if (!member) {
        throw Error('Informe membro válido!');
      }

      const response: AxiosResponse = await api.post(`/projects/adduser/${id}`, member);

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

  static async acceptInvite(token: string): Promise<ResponseI> {
    try {
      if (!token) {
        throw Error('Informe um token válido!');
      }

      const response: AxiosResponse = await api.post(`/projects/acceptinvite`, {
        invitationToken: token,
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

  static async updateMember(id: number, member: ProjectParticipationI): Promise<ResponseI> {
    try {
      if (!id) {
        throw Error('Informe um id válido!');
      }

      if (!member) {
        throw Error('Informe membro válido!');
      }

      const response: AxiosResponse = await api.put(`/projects/updateuser/${id}`, member);

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

  static async removeMember(id: number, memberId: number): Promise<ResponseI> {
    try {
      if (!id) {
        throw Error('Informe um id válido!');
      }

      if (!memberId) {
        throw Error('Informe membros válidos!');
      }

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

  static async getMembers(projectId: number): Promise<ResponseI> {
    try {
      if (!projectId) {
        throw Error('Informe um id válido!');
      }

      const response: AxiosResponse = await api.get(`/projects/listmembers/${projectId}`);

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
