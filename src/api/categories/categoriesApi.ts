import { axiosClient } from '../axiosClient'

export interface Category {
  id: number
  name: string
}

export const categoriesApi = {
  list: async () => {
    const { data } = await axiosClient.get<Category[]>('/api/categories')
    return data
  },
}
