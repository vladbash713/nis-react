export interface IItemStatus {
  id: number;
  user_id: number;
  inventory_item_id: number;
  status: string;
  created_at: number | string | undefined;
}
