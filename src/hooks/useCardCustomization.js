import { create } from 'zustand';

const useCardStore = create((set) => ({
    theme: 'blue',
    type: 'virtual',
    isLoading: false,
    error: null,
    setTheme: (theme) => set({ theme }),
    setType: (type) => set({ type }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
}));

export default useCardStore; 