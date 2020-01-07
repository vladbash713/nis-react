import {IInventoryItem} from './IInventory';
import {ISpace, IContainer} from './IStorage';
import {IUser} from './IUser';

export interface IPlacement {
  id: number;
  inventory_item_id: number;
  inventory_storage_container_id: number;
  inventory_storage_space_id: number;
  parent_inventory_storage_container_id: number | null;
  user_id: number;
  started_at: string | number | undefined;
  ended_at: string | number | undefined;
  created_at: string | number | undefined;
  is_used_on_ar: boolean;
  item: IInventoryItem;
  space: ISpace;
  container: IContainer;
  user: IUser;
  inventory_item: IInventoryItem;
}

export interface IPlacementGrouped {
  id: number;
  container_label: string;
  placements: IPlacement[];
}
