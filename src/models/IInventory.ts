import {Moment} from 'moment';
import {IJob} from './IJob';

export interface IInventory {
  id: number;
  job_id: number;
  created_at: Moment | string | null;
  all_checked_in_at: Moment | string | null;
  status: string;
  job_number: string;
  address: string;
  items_count: number | null;
  items: IInventoryItem[];
}

export interface IInventoryItem {
  id: number;
  inventory_id: number;
  job_id: number;
  identifier: string;
  name: string;
  quantity: number;
  condition?: string;
  serial_number?: string;
  model?: string;
  customer_location?: string;
  assessment_fee?: number;
  estimated_replacement_cost?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  inventory_item_standard_type_id: number;
  restoration_hours: number;
  restoration_cost: number;
  current_status: IInventoryItemStatus;
  job?: IJob;
}

export interface IInventoryItemStatus {
  id: number;
  inventory_item_id: number;
  user_id?: number;
  status: InventoryItemStatuses;
  created_at: string | null;
}

export interface IInventoryJob {
  id: number;
  job_id: number;
  all_checked_in_at?: string | null;
  status: string;
  job_number: string;
  address: string;
  created_at: string | null;
}

export enum InventoryStatuses {
  IN_PROGRESS = 'In-Progress',
  CMPLETED = 'Completed',
  NEW = 'New'
}

export enum InventoryItemStatuses {
  IN_PROGRESS = 'In-Progress',
  RESTORABLE = 'Restorable',
  NON_RESTORABLE = 'Non-Restorable',
  AWAITING_DISPOSAL_AUTHORITY = 'Awaiting Disposal Authority',
  READY_FOR_RETURN = 'Ready For Return',
  READY_TO_DISPOSE = 'Ready To Dispose',
  DISPOSED = 'Disposed',
  CLIENT_PICKED_UP = 'Client Picked Up',
  NEW = 'New',
  RETURNED = 'Returned'
}

export enum InventoryItemStatusesReturned {
  DISPOSED = 'Disposed',
  CLIENT_PICKED_UP = 'Client Picked Up',
  RETURNED = 'Returned'
}
