export interface NotificationListItem {
  id: number;
  residente_nome?: string;
  medicamento_nome?: string;
  destino?: string;
  data_prevista?: string;
}

export interface NotificationsResponse {
  items: NotificationListItem[];
  total: number;
  hasNext: boolean;
}
