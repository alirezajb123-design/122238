
export type Base = 'A' | 'T' | 'C' | 'G';

export interface Nucleotide {
  id: string;
  base: Base;
  position: number;
}

export enum GameState {
  START = 'START',
  HELICASE = 'HELICASE', // Unzipping phase
  POLYMERASE = 'POLYMERASE', // Matching bases phase
  LIGASE = 'LIGASE', // Finishing phase
  FINISHED = 'FINISHED'
}

export const PAIRING: Record<Base, Base> = {
  'A': 'T',
  'T': 'A',
  'C': 'G',
  'G': 'C'
};

export const BASE_COLORS: Record<Base, string> = {
  'A': 'bg-blue-500',
  'T': 'bg-red-500',
  'C': 'bg-emerald-500',
  'G': 'bg-amber-500'
};

export const BASE_NAMES: Record<Base, string> = {
  'A': 'آدنین',
  'T': 'تیمین',
  'C': 'سیتوزین',
  'G': 'گوانین'
};
