import { create } from 'zustand';
import { apiGetRutes, apiGetJadwal } from '@/lib/api';

interface Jadwal {
  id: number;
  tanggal_berangkat: string;
  jam_berangkat: string;
  status: string;
  bus: {
    id: number;
    nama: string;
    plat_nomor: string;
    kapasitas: number;
    photos: string[];
  };
  rute: {
    id: number;
    asal: {
      nama: string;
      photos: string[];
    };
    tujuan: {
      nama: string;
      photos: string[];
    };
  };
  kelas_tersedia: Array<{
    id: number;
    bus_kelas_bus_id: number;
    nama_kelas: string;
    harga: number;
    kursi_tersedia: number;
    total_kursi: number;
  }>;
}

interface Terminal {
  id: number;
  nama_terminal: string;
  nama_kota: string;
  alamat: string;
}

interface Rute {
  id: number;
  asal_terminal_id: number;
  tujuan_terminal_id: number;
  asal_terminal: Terminal;
  tujuan_terminal: Terminal;
}

interface AutocompleteOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface PassengerState {
  // Search states
  asal: string;
  tujuan: string;
  tanggal: string;
  asalOptions: AutocompleteOption[];
  tujuanOptions: AutocompleteOption[];
  isLoadingAsal: boolean;
  isLoadingTujuan: boolean;

  // Schedules
  availableSchedules: Jadwal[];
  isLoadingSchedules: boolean;
  schedulesError: string;
  refreshing: boolean;

  // Actions
  setAsal: (value: string) => void;
  setTujuan: (value: string) => void;
  setTanggal: (value: string) => void;
  setAsalOptions: (options: AutocompleteOption[]) => void;
  setTujuanOptions: (options: AutocompleteOption[]) => void;
  setIsLoadingAsal: (loading: boolean) => void;
  setIsLoadingTujuan: (loading: boolean) => void;
  setAvailableSchedules: (schedules: Jadwal[]) => void;
  setIsLoadingSchedules: (loading: boolean) => void;
  setSchedulesError: (error: string) => void;
  setRefreshing: (refreshing: boolean) => void;

  loadInitialTerminals: () => Promise<void>;
  fetchAsalOptions: (searchQuery: string) => Promise<void>;
  fetchTujuanOptions: (searchQuery: string) => Promise<void>;
  fetchAvailableSchedules: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

export const usePassengerStore = create<PassengerState>((set, get) => ({
  // Initial states
  asal: '',
  tujuan: '',
  tanggal: '',
  asalOptions: [],
  tujuanOptions: [],
  isLoadingAsal: false,
  isLoadingTujuan: false,
  availableSchedules: [],
  isLoadingSchedules: true,
  schedulesError: '',
  refreshing: false,

  // Setters
  setAsal: (value) => set({ asal: value }),
  setTujuan: (value) => set({ tujuan: value }),
  setTanggal: (value) => set({ tanggal: value }),
  setAsalOptions: (options) => set({ asalOptions: options }),
  setTujuanOptions: (options) => set({ tujuanOptions: options }),
  setIsLoadingAsal: (loading) => set({ isLoadingAsal: loading }),
  setIsLoadingTujuan: (loading) => set({ isLoadingTujuan: loading }),
  setAvailableSchedules: (schedules) => set({ availableSchedules: schedules }),
  setIsLoadingSchedules: (loading) => set({ isLoadingSchedules: loading }),
  setSchedulesError: (error) => set({ schedulesError: error }),
  setRefreshing: (refreshing) => set({ refreshing }),

  // Async actions
  loadInitialTerminals: async () => {
    const response = await apiGetRutes(1, undefined, undefined, 50);
    if (response && response.data) {
      const uniqueAsal = new Map<string, AutocompleteOption>();
      const uniqueTujuan = new Map<string, AutocompleteOption>();

      response.data.forEach((rute: Rute) => {
        uniqueAsal.set(rute.asal_terminal.nama_kota, {
          value: rute.asal_terminal.nama_kota,
          label: rute.asal_terminal.nama_kota,
          sublabel: rute.asal_terminal.nama_terminal,
        });
        uniqueTujuan.set(rute.tujuan_terminal.nama_kota, {
          value: rute.tujuan_terminal.nama_kota,
          label: rute.tujuan_terminal.nama_kota,
          sublabel: rute.tujuan_terminal.nama_terminal,
        });
      });

      const asalOpts = Array.from(uniqueAsal.values());
      const tujuanOpts = Array.from(uniqueTujuan.values());
      set({ asalOptions: asalOpts, tujuanOptions: tujuanOpts });
    }
  },

  fetchAsalOptions: async (searchQuery: string) => {
    set({ isLoadingAsal: true });
    const response = await apiGetRutes(1, searchQuery, undefined, 20);

    if (response.success && response.data) {
      const uniqueOptions = new Map<string, AutocompleteOption>();
      response.data.forEach((rute: Rute) => {
        const key = rute.asal_terminal.nama_kota;
        if (!uniqueOptions.has(key)) {
          uniqueOptions.set(key, {
            value: key,
            label: key,
            sublabel: rute.asal_terminal.nama_terminal,
          });
        }
      });
      set({ asalOptions: Array.from(uniqueOptions.values()) });
    }
    set({ isLoadingAsal: false });
  },

  fetchTujuanOptions: async (searchQuery: string) => {
    set({ isLoadingTujuan: true });
    const response = await apiGetRutes(1, undefined, searchQuery, 20);

    if (response.success && response.data) {
      const uniqueOptions = new Map<string, AutocompleteOption>();
      response.data.forEach((rute: Rute) => {
        const key = rute.tujuan_terminal.nama_kota;
        if (!uniqueOptions.has(key)) {
          uniqueOptions.set(key, {
            value: key,
            label: key,
            sublabel: rute.tujuan_terminal.nama_terminal,
          });
        }
      });
      set({ tujuanOptions: Array.from(uniqueOptions.values()) });
    }
    set({ isLoadingTujuan: false });
  },

  fetchAvailableSchedules: async () => {
    set({ isLoadingSchedules: true, schedulesError: '' });

    const response = await apiGetJadwal();

    if (response.error) {
      set({ schedulesError: response.error, availableSchedules: [] });
    } else if (response.success && response.data) {
      set({ availableSchedules: response.data.slice(0, 5) });
    } else {
      set({ availableSchedules: [] });
    }

    set({ isLoadingSchedules: false });
  },

  onRefresh: async () => {
    set({ refreshing: true });
    await get().fetchAvailableSchedules();
    await get().loadInitialTerminals();
    set({ refreshing: false });
  },
}));
