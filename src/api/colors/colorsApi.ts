import { axiosClient } from '../axiosClient'

export interface ColorOption {
  id: number
  name: string
}

export const colorsApi = {
  list: async () => {
    const { data } = await axiosClient.get<ColorOption[]>('/api/colors')
    return data
  },
}
