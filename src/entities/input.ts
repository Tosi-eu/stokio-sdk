export interface Input {
  id?: number;
  nome: string;
  descricao?: string;
  estoque_minimo?: number | null;
  preco?: number | null;
  preco_atualizado_em?: string | null;
}
