import { axiosClient } from '../axiosClient'
import type { ContactRequest, ContactResponse } from '../../types/contact'

const contactApi = {
  create: async (payload: ContactRequest) => {
    const { data } = await axiosClient.post<ContactResponse>('/api/contact', payload)
    return data
  },
}

export default contactApi
