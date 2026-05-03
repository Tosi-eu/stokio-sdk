export type DashboardStockProportionBlock = {
  percentuais: Record<string, number>;
  totais: Record<string, number>;
};

export type DashboardSectorProportion = DashboardStockProportionBlock & {
  key: string;
  nome: string;
  proportion_profile: string;
};

export interface RawDashboardMovement {
  tipo?: string;
  quantidade?: number;
  data?: string;
  setor?: string | null;
  MedicineModel?: { nome?: string };
  InputModel?: { nome?: string };
  LoginModel?: { login?: string };
  ResidentModel?: { nome?: string; num_casela?: number };
  CabinetModel?: { num_armario?: number };
}

export interface RawMedicineRankingItem {
  medicamento?: { nome?: string; principio_ativo?: string };
  total_movimentado?: number;
  total_entradas?: number;
  total_saidas?: number;
}

export interface RawCabinetStockItem {
  armario_id?: number;
  total_geral?: number;
}

export interface RawDrawerStockItem {
  gaveta_id?: number;
  total_geral?: number;
}

export interface DashboardSummaryResponse {
  alerts?: {
    noStock?: number;
    belowMin?: number;
    nearMin?: number;
    expired?: number;
    expiringSoon?: number;
  };
  recentMovements?: RawDashboardMovement[];
  nonMovementProducts?: unknown[];
  medicineRankingMore?: { data?: RawMedicineRankingItem[] };
  medicineRankingLess?: { data?: RawMedicineRankingItem[] };
  nursingProportion?: DashboardStockProportionBlock | null;
  pharmacyProportion?: DashboardStockProportionBlock | null;
  sectorProportions?: DashboardSectorProportion[];
  cabinetStockData?: { data?: RawCabinetStockItem[] };
  drawerStockData?: { data?: RawDrawerStockItem[] };
}

export type ExpiringItem = {
  tipo_item: "medicamento" | "insumo";
  item_id: number;
  estoque_id: number;
  nome: string;
  principio_ativo?: string | null;
  dosagem?: string | null;
  unidade_medida?: string | null;
  descricao?: string | null;
  validade: string | null;
  quantidade: number;
  lote: string | null;
  setor: string | null;
  paciente: string | null;
  dias_para_vencer: number;
};
