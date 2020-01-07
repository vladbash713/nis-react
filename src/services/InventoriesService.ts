import HttpService from './HttpService';
import {IListEnvelope, IObjectEnvelope} from 'src/models/IEnvelope';
import {IInventory, IInventoryItem} from 'src/models/IInventories';

export type IInventoriesSuccess = IListEnvelope<IInventory>;
export type IInventoryItemsSuccess = IListEnvelope<IInventoryItem>;
export type IInventorySuccess = IObjectEnvelope<IInventory>;

const ENDPOINT_PREFIX_INVENTORIES = '/v1/operations/inventories';

const getInventoryListByLocationID = async (locationID: string | number): Promise<IInventoriesSuccess> => {
  const res = await HttpService.get<IInventoriesSuccess>(
    `${ENDPOINT_PREFIX_INVENTORIES}/search?location_id=${locationID}`
  );
  return res;
};

const createNewInventory = async (job_id: string | number): Promise<IInventoriesSuccess> => {
  const res = await HttpService.post<any>(`${ENDPOINT_PREFIX_INVENTORIES}`, {job_id});
  return res;
};

const deleteInventory = async (inventory_id: string | number): Promise<IInventoriesSuccess> => {
  const res = await HttpService.remove<any>(`${ENDPOINT_PREFIX_INVENTORIES}/${inventory_id}`);
  return res;
};

const getInventoryInfo = async (inventoryID: string | number): Promise<IInventorySuccess> => {
  const res = await HttpService.get<IInventorySuccess>(`${ENDPOINT_PREFIX_INVENTORIES}/${inventoryID}`);
  return res;
};

const getInventoryItems = async (inventoryID: string | number): Promise<IInventoryItemsSuccess> => {
  const res = await HttpService.get<IInventoryItemsSuccess>(`${ENDPOINT_PREFIX_INVENTORIES}/${inventoryID}/items`);
  return res;
};

const getInventoryItem = async (inventoryItemID: string | number): Promise<any> => {
  const res = await HttpService.get<any>(`/v1/operations/inventory-items/${inventoryItemID}`);
  return res;
};

const markInventoryItemStatus = async (
  inventory_item_id: string | number,
  user_id: string | number,
  status: string
): Promise<any> => {
  const res = await HttpService.post<any>(`/v1/operations/inventory-item-statuses`, {
    inventory_item_id,
    user_id,
    status
  });
  return res;
};

const removeInventoryItem = async (inventory_item_id: string | number): Promise<any> => {
  const res = await HttpService.remove<any>(`/v1/operations/inventory-items/${inventory_item_id}`);
  return res;
};

const updateInventoryItem = async (inventory_item_id: number | string | undefined, data: any): Promise<any> => {
  const res = await HttpService.patch<any>(`/v1/operations/inventory-items/${inventory_item_id}`, data);
  return res;
};

const attachPhoto = async (
  inventory_item_id: number | string | undefined,
  photo_id: number | string,
  data: {description: string}
): Promise<any> => {
  return await HttpService.post<any>(`/v1/operations/inventory-item-photos`, {
    inventory_item_id,
    photo_id,
    description: data.description
  });
};

const getItemStandardTypes = async (): Promise<any> => {
  const res = await HttpService.get<any>(`/v1/operations/inventory-item-standard-types`);
  return res;
};

const getItemToDoList = async (inventoryItemId: number | string): Promise<any> => {
  const res = await HttpService.get<any>(`/v1/operations/inventory-todo/item/${inventoryItemId}`);
  return res;
};

const addNoteToInventoryItem = async (note_id: string | number, inventory_item_id: string | number): Promise<any> => {
  const res = await HttpService.post<void>(`/v1/operations/inventory-item-notes`, {
    inventory_item_id,
    note_id
  });
  return res;
};

const getInventoryReport = async (code: string | number): Promise<any> => {
  const res = await HttpService.get<any>(`/v1/operations/inventories/inventory-report-by-code?code=${code}`);
  return res;
};

// const detachPhoto = async (inventoryItemID: number | string, photoId: number | string): Promise<any> => {
//   return await HttpService.remove<any>(`/v1/jobs/${jobId}/photos/${photoId}`);
// };

const getReportLink = async (inventoryID: string | number): Promise<any> => {
  const res = await HttpService.post<any>(`/v1/operations/inventories/${inventoryID}/inventory-report-get-code`);
  return res;
};

const getContainers = async (): Promise<any> => {
  const res = await HttpService.get<any>(`/v1/operations/storage-containers`);
  return res;
};

const getSpaces = async (): Promise<any> => {
  const res = await HttpService.get<any>(`/v1/operations/storage-spaces`);
  return res;
};

const startPlacement = async (data: any): Promise<any> => {
  const res = await HttpService.post<any>(
    `/v1/operations/inventory-items/${data.inventory_item_id}/placement/start`,
    data
  );
  return res;
};

const stopPlacement = async (inventoryItemID: string | number): Promise<any> => {
  const res = await HttpService.post<any>(`/v1/operations/inventory-items/${inventoryItemID}/placement/stop`);
  return res;
};

export default {
  getInventoryListByLocationID,
  getInventoryInfo,
  getInventoryItems,
  createNewInventory,
  deleteInventory,
  getInventoryItem,
  markInventoryItemStatus,
  removeInventoryItem,
  updateInventoryItem,
  attachPhoto,
  getItemStandardTypes,
  getItemToDoList,
  addNoteToInventoryItem,
  getInventoryReport,
  getReportLink,
  getContainers,
  getSpaces,
  startPlacement,
  stopPlacement
};
