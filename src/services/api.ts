const API_BASE = import.meta.env.VITE_API_URL || '/api'

export interface BookingRequest {
  service: string
  projectType: string
  duration: string | null
  budget: { min: number; max: number }
  conceptStatus: string
  bookingDate: { day: number; month: number; year: number }
  phoneNumber: string
}

export interface BookingResponseData {
  id: string
  service: string
  projectType: string
  duration: string | null
  budget: { min: number; max: number }
  conceptStatus: string
  bookingDate: { day: number; month: number; year: number }
  phoneNumber: string
  status: string
  paymentId: string | null
  createdAt: string
  updatedAt: string
}

export interface PaymentRequest {
  bookingId?: string
  customerInfo: {
    fullName: string
    email: string
    phone: string
    additionalInfo: string
  }
  services: Array<{ name: string; price: number }>
  paymentMethod: 'bank' | 'momo'
  paymentType: 'full' | 'deposit'
  sendEmailConfirmation: boolean
}

export interface ContactRequest {
  name: string
  email: string
  subject: string
  message: string
}

export interface EquipmentCategory {
  name: string
  icon: string
  iconSize?: { width: number; height: number }
}

export interface EquipmentItem {
  id: number
  name: string
  accessories: string
  priceLabel: string
  pricePerDay: number | null
  imagePath: string
  category: string
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data?.error || 'Request failed')
  }
  return data as T
}

export const bookingApi = {
  async create(data: BookingRequest) {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return parseResponse<any>(res)
  },

  async getBookedDates(year: number, month: number) {
    const res = await fetch(`${API_BASE}/bookings/booked-dates/${year}/${month}`)
    return parseResponse<any>(res)
  },

  async getById(bookingId: string) {
    const res = await fetch(`${API_BASE}/bookings/${bookingId}`)
    return parseResponse<{ success: boolean; data: BookingResponseData }>(res)
  }
}

export const paymentApi = {
  async create(data: PaymentRequest) {
    const res = await fetch(`${API_BASE}/payments/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return parseResponse<any>(res)
  },

  async checkStatus(paymentId: string) {
    const res = await fetch(`${API_BASE}/payments/${paymentId}/status`)
    return parseResponse<any>(res)
  }
}

export const contactApi = {
  async submit(data: ContactRequest) {
    const res = await fetch(`${API_BASE}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return parseResponse<any>(res)
  }
}

export const contentApi = {
  async getEquipmentCatalog() {
    const res = await fetch(`${API_BASE}/content/equipment`)
    return parseResponse<{ success: boolean; data: { categories: EquipmentCategory[]; items: EquipmentItem[] } }>(res)
  },

  async getServiceConfig() {
    const res = await fetch(`${API_BASE}/content/service-config`)
    return parseResponse<any>(res)
  }
}
