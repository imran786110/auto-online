import apiClient from './client';

export const listingsAPI = {
  getAll: async (params) => {
    const response = await apiClient.get('/listings', { params });
    return response.data.listings;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/listings/${id}`);
    return response.data.listing;
  },

  create: async (formData) => {
    const response = await apiClient.post('/listings', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  update: async (id, formData) => {
    const response = await apiClient.put(`/listings/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/listings/${id}`);
    return response.data;
  },

  getUserListings: async (userId) => {
    const response = await apiClient.get(`/listings/user/${userId}`);
    return response.data.listings;
  }
};
