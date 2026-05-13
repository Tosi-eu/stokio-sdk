
import type { OperationType, ItemStockType } from "../enums";

export type StockExpiryStatus = "expired" | "warning" | "critical" | "ok";
export type StockQuantityStatus = "low" | "ok" | "zero" | "critical";

export interface StockItemRaw {
  item_id: number;
  estoque_id: number;
  tipo_item: OperationType | string;
  nome: string;
  principio_ativo?: string;
  descricao?: string | null;
  validade: string;
  quantidade: number;
  minimo?: number;
  origem: string;
  tipo: string;
  paciente?: string | null;
  armario_id?: number | null;
  gaveta_id?: number | null;
  casela_id?: number | null;
  setor: string;
  status?: string | null;
  suspenso_em?: string | null;
  st_expiracao?: string | null;
  msg_expiracao?: string | null;
  st_quantidade?: string | null;
  msg_quantidade?: string | null;
  lote?: string | null;
  preco?: number | null;
}

export interface StockItem {
  id: number;
  name: string;
  description?: string | null;
  activeSubstance?: string | null;
  dosage?: string | null;
  measurementUnit?: string | null;
  expiry: string;
  quantity: number;
  minimumStock?: number;
  patient?: string;
  cabinet?: number | string;
  drawer?: number | string;
  casela?: number | null;
  itemType: OperationType;
  stockType: ItemStockType | string;
  tipo?: string;
  status?: string | null;
  sector: string;
  suspended_at?: Date | null;
  origin?: string;
  lot?: string | null;
  preco?: number | null;
  expirationStatus: string;
  quantityStatus: string;
  expirationMsg?: string | null;
  quantityMsg?: string | null;
  destino?: string | null;
  detail?: string | null;
  daysToReplacement?: number | null;
  medicamentoId?: number | null;
}

export type StockFilterType =
  | "nearMin"
  | "belowMin"
  | "expired"
  | "expiringSoon"
  | "noPrice";
