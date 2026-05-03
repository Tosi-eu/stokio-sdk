export type RawMovement = {
  id?: number;
  tipo?: string;
  quantidade?: number;
  data?: string;
  medicamento_id?: number | null;
  insumo_id?: number | null;
  armario_id?: number | null;
  gaveta_id?: number | null;
  setor?: string | null;
  lote?: string | null;
  MedicineModel?: {
    nome?: string;
    principio_ativo?: string | null;
  };
  InputModel?: {
    nome?: string;
    descricao?: string | null;
  };
  LoginModel?: {
    login?: string;
    first_name?: string;
    last_name?: string;
  };
  ResidentModel?: {
    nome?: string;
    num_casela?: number;
  };
  CabinetModel?: {
    num_armario?: number;
  };
  DrawerModel?: {
    num_gaveta?: number;
    DrawerCategoryModel?: { nome?: string };
  };
};

export type ConsumptionPeriodItem = {
  period: string;
  entrada: number;
  saida: number;
};

export type ConsumptionByItemRow = {
  tipo_item: "medicamento" | "insumo";
  item_id: number;
  nome: string;
  entrada: number;
  saida: number;
};

export type ConsumptionByItemResponse = {
  items: ConsumptionByItemRow[];
  subtotal: { entrada: number; saida: number };
};
