import { create } from 'zustand';
import localforage from 'localforage';

export interface HeroConfig {
  title: string;
  titleHighlight: string;
  subtitle: string;
  backgroundImage: string;
}

const defaultHero: HeroConfig = {
  title: 'Sua voz, sua ',
  titleHighlight: 'carreira',
  subtitle: 'Milhares de minicursos gratuitos de dublagem e fonoaudiologia. O material de apoio definitivo para alunos e futuros profissionais do mercado.',
  backgroundImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
};

interface HeroState {
  hero: HeroConfig;
  isLoading: boolean;
  loadHero: () => Promise<void>;
  updateHero: (hero: HeroConfig) => Promise<void>;
}

export const useHeroStore = create<HeroState>((set) => ({
  hero: defaultHero,
  isLoading: true,
  loadHero: async () => {
    try {
      const storedHero = await localforage.getItem<HeroConfig>('hero');
      if (storedHero) {
        set({ hero: storedHero, isLoading: false });
      } else {
        await localforage.setItem('hero', defaultHero);
        set({ hero: defaultHero, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load hero:', error);
      set({ hero: defaultHero, isLoading: false });
    }
  },
  updateHero: async (updatedHero) => {
    await localforage.setItem('hero', updatedHero);
    set({ hero: updatedHero });
  },
}));
