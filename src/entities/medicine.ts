export interface Medicine {
  id?: number;
  nome: string;
  dosagem: string;
  unidade_medida: string;
  estoque_minimo?: number | null;
  principio_ativo: string;
  preco?: number | null;
  preco_atualizado_em?: string | null;
}
