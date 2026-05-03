export type StockProportionResponse = {
  percentuais: {
    medicamentos_geral: number;
    medicamentos_individual: number;
    insumos_geral: number;
    insumos_individual: number;
    carrinho_emergencia_medicamentos: number;
    carrinho_psicotropicos_medicamentos: number;
    carrinho_emergencia_insumos: number;
    carrinho_psicotropicos_insumos: number;
  };
  totais: {
    medicamentos_geral: number;
    medicamentos_individual: number;
    insumos_geral: number;
    insumos_individual: number;
    carrinho_emergencia_medicamentos: number;
    carrinho_psicotropicos_medicamentos: number;
    carrinho_emergencia_insumos: number;
    carrinho_psicotropicos_insumos: number;
    total_geral: number;
  };
};
