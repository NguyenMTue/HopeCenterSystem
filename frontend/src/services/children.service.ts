import apiClient from '../lib/api-client';

export interface ChildDto {
  id: string;
  fullName: string;
  dob?: string;
  gender?: number;
  healthStatus?: string;
  background?: string;
  status: number;
  admissionDate: string;
}

export const childrenService = {
  getChildren: async (params?: any) => {
    const response = await apiClient.get('/Children', { params });
    return response.data;
  },
  getChildById: async (id: string) => {
    const response = await apiClient.get(`/Children/${id}`);
    return response.data;
  },
  createChild: async (data: any) => {
    const response = await apiClient.post('/Children', data);
    return response.data;
  },
  updateChild: async (id: string, data: any) => {
    const response = await apiClient.put(`/Children/${id}`, data);
    return response.data;
  },
  deleteChild: async (id: string) => {
    const response = await apiClient.delete(`/Children/${id}`);
    return response.data;
  },
};
