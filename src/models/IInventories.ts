export interface IInventory {
  id: number | string;
  address: string;
  job_number: string;
  items_count: number | string;
  status: number | string;
}

export interface IInventoryItem {
  id: number | string;
  first_photo_url: string;
  name: string;
  current_location: number | string;
  status: number | string;
  updated_at: string;
  selected?: boolean;
  current_status?: any;
  placement?: any;
}

export interface IInventoryItemInfo {
  assessment_fee?: number | string;
  condition?: string;
  created_at?: string;
  current_location?: string;
  current_status?: any;
  customer_location?: string;
  deleted_at?: string;
  estimated_replacement_cost?: string;
  first_photo_url?: string;
  id?: number | string;
  identifier?: string;
  inventory_id?: number | string;
  inventory_item_standard_type_id?: number | string;
  job_id?: number | string;
  model?: any;
  name?: string;
  notes?: any[];
  photos?: any[];
  placements?: any[];
  quantity?: number | string;
  restoration_cost?: string;
  restoration_hours?: string;
  serial_number?: number | string;
  standard_type?: any;
  statuses?: any[];
  updated_at?: string;
  job_number?: string;
  placement?: any;
}
