import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000';
const API_TIMEOUT = parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000');

export const API_CONFIG = {
  BASE_URL: API_URL,
  TIMEOUT: API_TIMEOUT,
};

async function getAuthHeaders() {
  const token = await AsyncStorage.getItem('token');
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function buildUrl(endpoint: string, params?: Record<string, any>) {
  const url = new URL(`${API_URL}${endpoint}`);
  if (params) {
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined) {
        url.searchParams.append(key, params[key]);
      }
    });
  }
  return url.toString();
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    if (response.status === 401) {
      // Auto logout jika unauthorized
      await AsyncStorage.removeItem('token');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }
  try {
    return await response.json();
  } catch (error) {
    console.log('JSON Parse Error:', error);
    const responseText = await response.text();
    console.log('Response Text:', responseText);
    throw new Error('Invalid JSON response from server');
  }
}

export async function apiLogin(email: string, password: string) {
  try {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    const response = await fetch(buildUrl('/api/login'), {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: formData,
    });

    return await handleResponse(response);
  } catch (error) {
    console.log('Login Error:', error);
    return { error: error instanceof Error ? error.message : 'Login failed' };
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

    const response = await fetch(buildUrl('/api/register'), {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: formData,
    });

    return await handleResponse(response);
  } catch (error) {
    console.log('Register Error:', error);
    return { error: error instanceof Error ? error.message : 'Registration failed' };
  }
}

export async function apiVerifyTicket(kodeTicket: string) {
  try {
    const response = await fetch(buildUrl(`/api/tiket/${kodeTicket}/verify`), {
      method: 'POST',
      headers: await getAuthHeaders(),
    });

    try {
      return await response.json();
    } catch (jsonError) {
      const responseText = await response.text();
      console.log('Verify Ticket JSON Error:', jsonError);
      console.log('Response Text:', responseText);
      throw new Error('Invalid JSON response from server');
    }
  } catch (error) {
    console.log('Verify Ticket Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ticket verification failed',
    };
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

    const response = await fetch(buildUrl('/api/rute', params), {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    return await handleResponse(response);
  } catch (error) {
    console.log('Get Rutes Error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch routes' };
  }
}

export async function apiGetJadwal(
  asal?: string,
  tujuan?: string,
  tanggal?: string,
  page: number = 1
) {
  try {
    const params = {
      asal,
      tujuan,
      tanggal,
      page,
    };

    const response = await fetch(buildUrl('/api/jadwal', params), {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    return await handleResponse(response);
  } catch (error) {
    console.log('Get Jadwal Error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch schedules' };
  }
}

export async function apiGetJadwalDetail(jadwalId: number) {
  try {
    const response = await fetch(buildUrl(`/api/jadwal/${jadwalId}`), {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    return await handleResponse(response);
  } catch (error) {
    console.log('Get Jadwal Detail Error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch schedule detail' };
  }
}

export async function apiGetKursi(jadwalId: number, jadwalKelasBusId: number) {
  try {
    const params = {
      jadwal_kelas_bus_id: jadwalKelasBusId,
    };

    const response = await fetch(buildUrl(`/api/jadwal/${jadwalId}/kursi`, params), {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    return await handleResponse(response);
  } catch (error) {
    console.log('Get Kursi Error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch seats' };
  }
}

export async function apiCreateTiket(jadwalKelasBusId: number, kursiId: number) {
  try {
    const response = await fetch(buildUrl('/api/tiket'), {
      method: 'POST',
      headers: {
        ...(await getAuthHeaders()),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jadwal_kelas_bus_id: jadwalKelasBusId,
        kursi_id: kursiId,
      }),
    });

    return await handleResponse(response);
  } catch (error) {
    console.log('Create Tiket Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create ticket',
    };
  }
}

export async function apiGetMyTickets() {
  try {
    const response = await fetch(buildUrl('/api/my-tickets'), {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    try {
      return await response.json();
    } catch (jsonError) {
      const responseText = await response.text();
      console.log('Get My Tickets JSON Error:', jsonError);
      console.log('Response Text:', responseText);
      throw new Error('Invalid JSON response from server');
    }
  } catch (error) {
    console.log('Get My Tickets Error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch tickets' };
  }
}

export async function apiGetTicketByCode(kodeTicket: string) {
  try {
    const response = await fetch(buildUrl(`/api/tiket/${kodeTicket}`), {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    return await handleResponse(response);
  } catch (error) {
    console.log('Get Ticket By Code Error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch ticket' };
  }
}

export async function apiGetTicketDetail(ticketId: number) {
  try {
    const response = await fetch(buildUrl(`/api/tiket/detail/${ticketId}`), {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    return await handleResponse(response);
  } catch (error) {
    console.log('Get Ticket Detail Error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch ticket detail' };
  }
}

export async function apiGetProfile() {
  try {
    const response = await fetch(buildUrl('/api/user'), {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    return await handleResponse(response);
  } catch (error) {
    console.log('Get Profile Error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch profile' };
  }
}

export async function apiGetBanners() {
  try {
    const response = await fetch(buildUrl('/api/banner'), {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    return await handleResponse(response);
  } catch (error) {
    console.log('Get Banners Error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch banners' };
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

    const response = await fetch(buildUrl('/api/user'), {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: formData,
    });

    return await handleResponse(response);
  } catch (error) {
    console.log('Update Profile Error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to update profile' };
  }
}

export async function apiUpdatePassword(data: {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}) {
  try {
    const response = await fetch(buildUrl('/api/user/password'), {
      method: 'PUT',
      headers: {
        ...(await getAuthHeaders()),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return await handleResponse(response);
  } catch (error) {
    console.log('Update Password Error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to update password' };
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

    const response = await fetch(buildUrl('/api/upload/profile'), {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: formData,
    });

    return await handleResponse(response);
  } catch (error) {
    console.log('Upload Photo Error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to upload photo' };
  }
}

// =================== PAYMENT APIs ===================

export async function apiCreatePayment(
  tiketId: number,
  metode: 'xendit' | 'tunai',
  successRedirectUrl?: string,
  failureRedirectUrl?: string
) {
  try {
    const response = await fetch(buildUrl('/api/pembayaran'), {
      method: 'POST',
      headers: {
        ...(await getAuthHeaders()),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tiket_id: tiketId,
        metode,
        success_redirect_url: successRedirectUrl,
        failure_redirect_url: failureRedirectUrl,
      }),
    });

    return await handleResponse(response);
  } catch (error) {
    console.log('Create Payment Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment',
    };
  }
}

export async function apiGetPayments() {
  try {
    const response = await fetch(buildUrl('/api/pembayaran'), {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    return await handleResponse(response);
  } catch (error) {
    console.log('Get Payments Error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch payments' };
  }
}

export async function apiGetPaymentDetail(paymentId: number) {
  try {
    const response = await fetch(buildUrl(`/api/pembayaran/${paymentId}`), {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    return await handleResponse(response);
  } catch (error) {
    console.log('Get Payment Detail Error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch payment detail' };
  }
}

export async function apiCheckPaymentStatus(paymentId: number) {
  try {
    const response = await fetch(buildUrl(`/api/pembayaran/${paymentId}/check-status`), {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    return await handleResponse(response);
  } catch (error) {
    console.log('Check Payment Status Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check payment status',
    };
  }
}

export async function apiApprovePayment(paymentId: number) {
  try {
    const response = await fetch(buildUrl(`/api/pembayaran/${paymentId}/approve`), {
      method: 'POST',
      headers: await getAuthHeaders(),
    });

    return await handleResponse(response);
  } catch (error) {
    console.log('Approve Payment Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to approve payment',
    };
  }
}

export async function apiRejectPayment(paymentId: number) {
  try {
    const response = await fetch(buildUrl(`/api/pembayaran/${paymentId}/reject`), {
      method: 'POST',
      headers: await getAuthHeaders(),
    });

    return await handleResponse(response);
  } catch (error) {
    console.log('Reject Payment Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reject payment',
    };
  }
}

export async function apiGetDriverSchedules() {
  try {
    const response = await fetch(buildUrl('/api/driver'), {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    return await handleResponse(response);
  } catch (error) {
    console.log('Get Driver Schedules Error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch driver schedules' };
  }
}

export async function apiGetDriverSeats(jadwalId: number) {
  try {
    const response = await fetch(buildUrl(`/api/driver/kursi/${jadwalId}`), {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    return await handleResponse(response);
  } catch (error) {
    console.log('Get Driver Seats Error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch driver seats' };
  }
}
