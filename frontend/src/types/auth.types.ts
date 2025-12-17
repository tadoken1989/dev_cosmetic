export interface User {
  id: number
  email: string
  fullName: string
  role: string
  branchId?: number
}

export interface LoginCredentials {
  email: string
  password: string
}

