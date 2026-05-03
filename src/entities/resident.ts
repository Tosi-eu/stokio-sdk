export interface Resident {
  casela: number;
  nome: string;
  /** ISO `yyyy-MM-dd` ou omitido */
  data_nascimento?: string | null;
}

export interface ResidentOption {
  casela: number;
  name: string;
}
