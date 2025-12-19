import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';
const API_TIMEOUT = parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000');

const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    Accept: 'application/json',
  },
});

// Axios interceptor untuk menambahkan Authorization header
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const API_CONFIG = {
  BASE_URL: API_URL,
  TIMEOUT: API_TIMEOUT,
};

export async function apiLogin(email: string, password: string) {
  try {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    const response = await api.post('/api/login', formData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log('Login Error:', error.response?.data || error.message);
      return { error: error.response?.data?.message || 'Login failed' };
    }
    console.log('Login Error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function apiRegister(email: string, password: string, name?: string) {
  try {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    if (name) {
      formData.append('name', name);
    }

    const response = await api.post('/api/register', formData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log('Register Error:', error.response?.data || error.message);
      return { error: error.response?.data?.message || 'Registration failed' };
    }
    console.log('Register Error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function apiVerifyTicket(kodeTicket: string) {
  try {
    const response = await api.post(`/api/tiket/${kodeTicket}/verify`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log('Verify Ticket Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Ticket verification failed',
      };
    }
    console.log('Verify Ticket Error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// =================== BOOKING FLOW APIs ===================

export async function apiGetRutes(
  page: number = 1,
  asal?: string,
  tujuan?: string,
  perPage: number = 10
) {
  try {
    const params: any = {
      include: 'asalTerminal,tujuanTerminal',
      page,
      per_page: perPage,
    };

    if (asal) {
      params.asal = asal;
    }

    if (tujuan) {
      params.tujuan = tujuan;
    }

    const response = await api.get('/api/rute', { params });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log('Get Rutes Error:', error.response?.data || error.message);
      return { error: error.response?.data?.message || 'Failed to fetch routes' };
    }
    console.log('Get Rutes Error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function apiGetJadwal(
  asal?: string,
  tujuan?: string,
  tanggal?: string,
  page: number = 1
) {
  try {
    const response = await api.get('/api/jadwal', {
      params: {
        asal,
        tujuan,
        tanggal,
        page,
      },
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log('Get Jadwal Error:', error.response?.data || error.message);
      return { error: error.response?.data?.message || 'Failed to fetch schedules' };
    }
    console.log('Get Jadwal Error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function apiGetJadwalDetail(jadwalId: number) {
  try {
    const response = await api.get(`/api/jadwal/${jadwalId}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log('Get Jadwal Detail Error:', error.response?.data || error.message);
      return { error: error.response?.data?.message || 'Failed to fetch schedule detail' };
    }
    console.log('Get Jadwal Detail Error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function apiGetKursi(jadwalId: number, jadwalKelasBusId: number) {
  try {
    const response = await api.get(`/api/jadwal/${jadwalId}/kursi`, {
      params: {
        jadwal_kelas_bus_id: jadwalKelasBusId,
      },
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log('Get Kursi Error:', error.response?.data || error.message);
      return { error: error.response?.data?.message || 'Failed to fetch seats' };
    }
    console.log('Get Kursi Error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function apiCreateTiket(jadwalKelasBusId: number, kursiId: number) {
  try {
    const response = await api.post('/api/tiket', {
      jadwal_kelas_bus_id: jadwalKelasBusId,
      kursi_id: kursiId,
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log('Create Tiket Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create ticket',
        missing_fields: error.response?.data?.missing_fields,
      };
    }
    console.log('Create Tiket Error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function apiGetMyTickets() {
  try {
    const response = await api.get('/api/my-tickets');
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log('Get My Tickets Error:', error.response?.data || error.message);
      return { error: error.response?.data?.message || 'Failed to fetch tickets' };
    }
    console.log('Get My Tickets Error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function apiGetTicketByCode(kodeTicket: string) {
  try {
    const response = await api.get(`/api/tiket/${kodeTicket}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log('Get Ticket By Code Error:', error.response?.data || error.message);
      return { error: error.response?.data?.message || 'Failed to fetch ticket' };
    }
    console.log('Get Ticket By Code Error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function apiGetTicketDetail(ticketId: number) {
  try {
    const response = await api.get(`/api/tiket/detail/${ticketId}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log('Get Ticket Detail Error:', error.response?.data || error.message);
      return { error: error.response?.data?.message || 'Failed to fetch ticket detail' };
    }
    console.log('Get Ticket Detail Error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function apiGetProfile() {
  try {
    const response = await api.get('/api/user');
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log('Get Profile Error:', error.response?.data || error.message);
      return { error: error.response?.data?.message || 'Failed to fetch profile' };
    }
    console.log('Get Profile Error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function apiUpdateProfile(data: any) {
  try {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('nik', data.nik);
    formData.append('tanggal_lahir', data.tanggal_lahir);
    formData.append('jenis_kelamin', data.jenis_kelamin);
    formData.append('nomor_telepon', data.nomor_telepon);

    const response = await api.put('/api/user', formData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log('Update Profile Error:', error.response?.data || error.message);
      return { error: error.response?.data?.message || 'Failed to update profile' };
    }
    console.log('Update Profile Error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function apiUploadPhoto(photoUri: string) {
  try {
    const formData = new FormData();
    const fileName = photoUri.split('/').pop();
    const fileType = fileName?.split('.').pop();

    formData.append('photo', {
      uri: photoUri,
      name: fileName,
      type: `image/${fileType}`,
    } as any);

    const response = await api.post('/api/upload/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log('Upload Photo Error:', error.response?.data || error.message);
      return { error: error.response?.data?.message || 'Failed to upload photo' };
    }
    console.log('Upload Photo Error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

// =================== PAYMENT APIs ===================

export async function apiCreatePayment(
  tiketId: number,
  metode: 'xendit' | 'transfer' | 'tunai',
  successRedirectUrl?: string,
  failureRedirectUrl?: string
) {
  try {
    const response = await api.post('/api/pembayaran', {
      tiket_id: tiketId,
      metode,
      success_redirect_url: successRedirectUrl,
      failure_redirect_url: failureRedirectUrl,
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log('Create Payment Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create payment',
      };
    }
    console.log('Create Payment Error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function apiGetPayments() {
  try {
    const response = await api.get('/api/pembayaran');
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log('Get Payments Error:', error.response?.data || error.message);
      return { error: error.response?.data?.message || 'Failed to fetch payments' };
    }
    console.log('Get Payments Error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function apiGetPaymentDetail(paymentId: number) {
  try {
    const response = await api.get(`/api/pembayaran/${paymentId}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log('Get Payment Detail Error:', error.response?.data || error.message);
      return { error: error.response?.data?.message || 'Failed to fetch payment detail' };
    }
    console.log('Get Payment Detail Error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function apiCheckPaymentStatus(paymentId: number) {
  try {
    const response = await api.get(`/api/pembayaran/${paymentId}/check-status`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log('Check Payment Status Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to check payment status',
      };
    }
    console.log('Check Payment Status Error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function apiApprovePayment(paymentId: number) {
  try {
    const response = await api.post(`/api/pembayaran/${paymentId}/approve`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log('Approve Payment Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to approve payment',
      };
    }
    console.log('Approve Payment Error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function apiRejectPayment(paymentId: number) {
  try {
    const response = await api.post(`/api/pembayaran/${paymentId}/reject`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log('Reject Payment Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to reject payment',
      };
    }
    console.log('Reject Payment Error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function apiGetDriverSchedules() {
  try {
    const response = await api.get('/api/driver');
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log('Get Driver Schedules Error:', error.response?.data || error.message);
      return { error: error.response?.data?.message || 'Failed to fetch driver schedules' };
    }
    console.log('Get Driver Schedules Error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function apiGetDriverSeats(jadwalId: number) {
  try {
    const response = await api.get(`/api/driver/kursi/${jadwalId}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log('Get Driver Seats Error:', error.response?.data || error.message);
      return { error: error.response?.data?.message || 'Failed to fetch driver seats' };
    }
    console.log('Get Driver Seats Error:', error);
    return { error: 'An unexpected error occurred' };
  }
}
