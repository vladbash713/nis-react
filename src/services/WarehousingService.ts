import HttpService from 'src/services/HttpService';
import {IInventory, IInventoryJob} from 'src/models/IInventory';
import {IListEnvelope, IObjectEnvelope} from 'src/models/IEnvelope';
import PageSizes from 'src/constants/PageSizes';
import {IReturnedItems} from 'src/models/IReturnedItems';
import {IWarehouseInfo} from 'src/redux/warehousingDucks';
import {IStorageType, ISpace} from 'src/models/IStorage';
import {IPlacement} from 'src/models/IPlacement';
import {IGetInventoriesFilters, IItemsInStorageFitlers, IReturnedDisposed} from 'src/models/IWarehousingFilters';

export type IInventoriesSuccess = IListEnvelope<IInventory>;
export type IInventoryJobsSuccess = IListEnvelope<IInventoryJob>;
export type IReturnedItemsSuccess = IListEnvelope<IReturnedItems>;
export type IWarehouseInfoSuccess = IObjectEnvelope<IWarehouseInfo>;
export type IStorageUsageSuccess = IListEnvelope<IStorageType>;
export type IStorageItemsSucess = IListEnvelope<IPlacement>;
export type IStorageSpacesSucess = IListEnvelope<ISpace>;

const getInventories = async (
  locationId: number | null,
  filters: IGetInventoriesFilters,
  page?: number
): Promise<IInventoriesSuccess> => {
  const res = await HttpService.get<IInventoriesSuccess>('/v1/operations/inventories/search', {
    location_id: locationId,
    per_page: PageSizes.Big,
    job_id: filters.job_id,
    status: filters.status,
    page
  });
  return res;
};

const getStorageItems = async (
  locationId: number | null,
  filters: IItemsInStorageFitlers,
  page?: number
): Promise<IStorageItemsSucess> => {
  const res = await HttpService.get<IStorageItemsSucess>('/v1/operations/inventory-items/locations', {
    location_id: locationId,
    per_page: PageSizes.Middle,
    job_id: filters.job_id,
    status: filters.status,
    page
  });
  return res;
};

const getStorageUsage = async (locationId: number, page?: number): Promise<IStorageUsageSuccess> => {
  const res = await HttpService.get<IStorageUsageSuccess>('/v1/operations/storage-location-usage', {
    location_id: locationId,
    per_page: PageSizes.Middle,
    page
  });
  return res;
};

const getReadyToReturn = async (
  locationId: number | null,
  page?: number,
  jobId?: number | null
): Promise<IInventoriesSuccess> => {
  const res = await HttpService.get<IInventoriesSuccess>('/v1/operations/inventories/ready-for-return-dispose', {
    location_id: locationId,
    per_page: PageSizes.Middle,
    job_id: jobId,
    page
  });
  return res;
};

const getReturned = async (
  locationId: number | null,
  filters: IReturnedDisposed,
  page?: number
): Promise<IInventoriesSuccess> => {
  const res = await HttpService.get<IInventoriesSuccess>('/v1/operations/inventory-items/returned-disposed', {
    location_id: locationId,
    per_page: PageSizes.Middle,
    job_id: filters.job_id,
    status: filters.status,
    page
  });
  return res;
};

const getToReturnDisposeJobs = async (locationId: number | null, page?: number): Promise<IInventoryJobsSuccess> => {
  const res = await HttpService.get<IInventoryJobsSuccess>('/v1/jobs/inventory-items/ready-for-return-dispose', {
    location_id: locationId,
    per_page: PageSizes.Huge,
    page
  });
  return res;
};

const getReturnedDisposedJobs = async (locationId: number | null, page?: number): Promise<IInventoryJobsSuccess> => {
  const res = await HttpService.get<IInventoryJobsSuccess>('/v1/jobs/inventory-items/returned-disposed', {
    location_id: locationId,
    per_page: PageSizes.Huge,
    page
  });
  return res;
};

const getWarehouseInfo = async (locationId: number | null): Promise<IWarehouseInfoSuccess> => {
  const res = await HttpService.get<IWarehouseInfoSuccess>('/v1/operations/inventories/info', {
    location_id: locationId
  });
  return res;
};

const scanToLocation = async (inventoryStorageSpaceId: number, inventoryItemIds: number[]): Promise<any> => {
  const res = await HttpService.post<any>('/v1/operations/inventory-items/scan-to-placement', {
    inventoryStorageSpaceId,
    inventoryItemIds
  });
  return res;
};

const getStorageSpaces = async (): Promise<IStorageSpacesSucess> => {
  return await HttpService.get<IStorageSpacesSucess>('/v1/operations/storage-spaces');
};

export default {
  getInventories,
  getReadyToReturn,
  getStorageItems,
  getToReturnDisposeJobs,
  getReturnedDisposedJobs,
  getReturned,
  getWarehouseInfo,
  getStorageUsage,
  getStorageSpaces,
  scanToLocation
};
