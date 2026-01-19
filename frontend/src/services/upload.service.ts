import apiClient from './api/client'

export interface UploadImageResponse {
  success: boolean
  data: {
    url: string
    filename: string
    originalName: string
    size: number
    mimetype: string
  }
}

export const uploadService = {
  async uploadImage(file: File): Promise<UploadImageResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<UploadImageResponse>('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  },
}





