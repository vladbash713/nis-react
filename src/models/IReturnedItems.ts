import {Moment} from 'moment';
import {IInventory} from './IInventory';
import {IItemStatus} from './IItemStatus';

export interface IReturnedItems {
  id: number;
  job_id: number;
  name: string;
  model: string;
  quantity: number;
  status: string;
  serial_number: string;
  identifier: string;
  all_checked_in_at: string | Moment | null;
  created_at: string | Moment | null;
  inventory: IInventory;
  current_status: IItemStatus;
}
