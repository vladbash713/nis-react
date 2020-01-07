import {ILocation} from './IAddress';

export interface IStorageType {
  id: number;
  name: string;
  is_chargeable: boolean;
  spaces: ISpace[];
}

export interface ISpace {
  id: number;
  location_id: number;
  inventory_storage_space_type_id: number;
  identifier: string;
  name: string;
  created_at: number | string | undefined;
  deleted_at: number | string | undefined;
  status: string;
  location: ILocation;
  inventory_storage_space_type: IStorageType;
}

export interface IContainer {
  id: number;
  inventory_storage_container_type_id: number;
  label: string;
  created_at: number | string | undefined;
  deleted_at: number | string | undefined;
}
