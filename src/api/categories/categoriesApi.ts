import { axiosClient } from '../axiosClient'

export interface Category {
  id: number
  name: string
  parentId: number | null
  children: Category[]
}

export const categoriesApi = {
  list: async () => {
    const { data } = await axiosClient.get<Category[]>('/api/categories')
    return data
  },
  create: async (payload: { name: string; description?: string; parentId?: number | null }) => {
    const { data } = await axiosClient.post<Category>('/api/categories', payload)
    return data
  },
  update: async (id: number, payload: { name: string; description?: string; parentId?: number | null }) => {
    const { data } = await axiosClient.put<Category>(`/api/categories/${id}`, payload)
    return data
  },
  delete: async (id: number) => {
    await axiosClient.delete(`/api/categories/${id}`)
  }
}
