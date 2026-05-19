export interface Resident {
  casela: number;
  nome: string;
  cpf?: string | null;
  telefone_responsavel?: string | null;
  data_nascimento?: string | null;
}

export interface ResidentOption {
  casela: number;
  name: string;
}
