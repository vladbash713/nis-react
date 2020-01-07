import {combineReducers, Reducer} from 'redux';
import {
  createAsyncAction,
  IReduxWrapConfig,
  IReturnType,
  reduxWrap,
  createSyncAction,
  createSelectionReducer,
  createSelectActionsCreators,
  ISelectionReducerConfig
} from './reduxWrap';
import WarehousingService, {
  IInventoryJobsSuccess,
  IReturnedItemsSuccess,
  IWarehouseInfoSuccess,
  IStorageUsageSuccess,
  IStorageItemsSucess,
  IStorageSpacesSucess
} from 'src/services/WarehousingService';
import {IInventoriesSuccess} from 'src/services/WarehousingService';
import {IAppState} from './index';
import JobService, {IJobsSuccess} from 'src/services/JobService';
import {IPlacement, IPlacementGrouped} from 'src/models/IPlacement';
import {IGetInventoriesFilters, IItemsInStorageFitlers, IReturnedDisposed} from 'src/models/IWarehousingFilters';

const WAREHOUSING_STORE_KEY = 'Steamatic/Warehousing/';
const SET_LOCATION = WAREHOUSING_STORE_KEY + 'Steamatic/Finance/setLocation';

const TOGGLE_GROUP = 'Steamatic/Finance/ReceivePayments/TOGGLE_GROUP';
const RESET_SELECTED_GROUP = 'Steamatic/Finance/ReceivePayments/RESET_SELECTED_GROUP';
const MASS_SELECT_GROUP = 'Steamatic/Finance/ReceivePayments/MASS_SELECT_GROUP';

const TOGGLE_ENTITY = 'Steamatic/Finance/ReceivePayments/TOGGLE_ENTITY';
const TOGGLE_PLACEMENT = 'Steamatic/Finance/ReceivePayments/TOGGLE_PLACEMENT';
const RESET_SELECTED_PLACEMNT = 'Steamatic/Finance/ReceivePayments/RESET_SELECTED_PLACEMENT';
const MASS_SELECT_PLACEMENTS = 'Steamatic/Finance/ReceivePayments/MASS_SELECT_PLACEMENTS';

enum WarehousingOptionsType {
  selectedLocation = 'selectedLocation',
  selectedInventoryJob = 'selectedInventoryJob'
}

enum WarehousingType {
  inventories = 'inventories',
  readyToReturn = 'readyToReturn',
  itemsInStorage = 'itemsInStorage',
  toReturnDisposeJobs = 'toReturnDisposeJobs',
  returnedDisposedJobs = 'returnedDisposedJobs',
  options = 'options',
  returnedItems = 'returnedItems',
  selectedGroup = 'selectedGroup',
  selectedPlacements = 'selectedPlacements',
  warehouseInfo = 'warehouseInfo',
  storageUsage = 'storageUsage',
  jobsNewInventory = 'jobsNewInventory',
  storageSpaces = 'storageSpaces'
}

enum ActionTypes {
  load = 'load',
  loadComplete = 'loadComplete',
  reset = 'reset',
  error = 'error'
}

const selectPlacementReducerConfig = {
  toggleEntity: TOGGLE_ENTITY,
  toggle: TOGGLE_PLACEMENT,
  resetSelected: RESET_SELECTED_PLACEMNT,
  massSelect: MASS_SELECT_PLACEMENTS
};

const selectGroupReducerConfig = {
  toggleEntity: TOGGLE_ENTITY,
  toggle: TOGGLE_GROUP,
  resetSelected: RESET_SELECTED_GROUP,
  massSelect: MASS_SELECT_GROUP
};

export interface IWarehousingOptions {
  selectedLocation?: number | null;
  selectedInventoryJob?: number | null;
}

export interface IWarehouseInfo {
  inventories: number;
  items_in_storage: number;
  storage_location_usage: number;
  ready_to_return_dispose: number;
  returned_disposed: number;
}

export type IWarehousingInventoriesState = IReturnType<IInventoriesSuccess>;
export type IWarehousingReadyToReturnState = IReturnType<IInventoriesSuccess>;
export type IWarehousingReturnedState = IReturnType<IReturnedItemsSuccess>;
export type IWarehousingStoragesState = IReturnType<IStorageItemsSucess>;
export type IWarehousingInventoryJobsState = IReturnType<IInventoryJobsSuccess>; // TODO: Replace return type
export type IWarehousingOptionsState = IWarehousingOptions;
export type IWarehousingInfoState = IReturnType<IWarehouseInfoSuccess>;
export type IWarehousingStorageUsage = IReturnType<IStorageUsageSuccess>;
export type IWarehousingJobsNewInventoryState = IReturnType<IJobsSuccess>;
export type IWarehousingStorageSpacesState = IReturnType<IStorageSpacesSucess>;

export interface IWarehousingState {
  [WarehousingType.inventories]: IWarehousingInventoriesState;
  [WarehousingType.readyToReturn]: IWarehousingReadyToReturnState;
  [WarehousingType.returnedItems]: IWarehousingReturnedState;
  [WarehousingType.itemsInStorage]: IWarehousingStoragesState;
  [WarehousingType.storageUsage]: IWarehousingStorageUsage;
  [WarehousingType.toReturnDisposeJobs]: IWarehousingInventoryJobsState;
  [WarehousingType.returnedDisposedJobs]: IWarehousingInventoryJobsState;
  [WarehousingType.options]: IWarehousingOptionsState;
  [WarehousingType.selectedGroup]: ISelectionReducerConfig;
  [WarehousingType.selectedPlacements]: ISelectionReducerConfig;
  [WarehousingType.warehouseInfo]: IWarehousingInfoState;
  [WarehousingType.jobsNewInventory]: IWarehousingJobsNewInventoryState;
  [WarehousingType.storageSpaces]: IWarehousingStorageSpacesState;
}

const defaultState = {
  [WarehousingOptionsType.selectedLocation]: null,
  [WarehousingOptionsType.selectedInventoryJob]: null
};

const reducer: Reducer<IWarehousingOptions> = (state = defaultState, action = {type: null}) => {
  switch (action.type) {
    case SET_LOCATION:
      return {...state, ...action.payload};
    default:
      return state;
  }
};

function getActionTypeForEntity(finReportEntity: WarehousingType, actionType: ActionTypes) {
  return `${WAREHOUSING_STORE_KEY}${finReportEntity}/${actionType}`;
}

const fullActionTypes = [ActionTypes.load, ActionTypes.loadComplete, ActionTypes.reset, ActionTypes.error];

function configForWarehousingEntity(finReportEntity: WarehousingType, actionList: ActionTypes[] = fullActionTypes) {
  return actionList.reduce((res, type) => ({...res, [type]: getActionTypeForEntity(finReportEntity, type)}), {});
}

export const WarehousingReducer = combineReducers({
  [WarehousingType.inventories]: reduxWrap(configForWarehousingEntity(WarehousingType.inventories) as IReduxWrapConfig),
  [WarehousingType.readyToReturn]: reduxWrap(configForWarehousingEntity(
    WarehousingType.readyToReturn
  ) as IReduxWrapConfig),
  [WarehousingType.returnedItems]: reduxWrap(configForWarehousingEntity(
    WarehousingType.returnedItems
  ) as IReduxWrapConfig),
  [WarehousingType.itemsInStorage]: reduxWrap(configForWarehousingEntity(
    WarehousingType.itemsInStorage
  ) as IReduxWrapConfig),
  [WarehousingType.storageUsage]: reduxWrap(configForWarehousingEntity(
    WarehousingType.storageUsage
  ) as IReduxWrapConfig),
  [WarehousingType.toReturnDisposeJobs]: reduxWrap(configForWarehousingEntity(
    WarehousingType.toReturnDisposeJobs
  ) as IReduxWrapConfig),
  [WarehousingType.returnedDisposedJobs]: reduxWrap(configForWarehousingEntity(
    WarehousingType.returnedDisposedJobs
  ) as IReduxWrapConfig),
  [WarehousingType.warehouseInfo]: reduxWrap(configForWarehousingEntity(
    WarehousingType.warehouseInfo
  ) as IReduxWrapConfig),
  [WarehousingType.jobsNewInventory]: reduxWrap(configForWarehousingEntity(
    WarehousingType.jobsNewInventory
  ) as IReduxWrapConfig),
  [WarehousingType.storageSpaces]: reduxWrap(configForWarehousingEntity(
    WarehousingType.storageSpaces
  ) as IReduxWrapConfig),
  [WarehousingType.selectedGroup]: createSelectionReducer(selectGroupReducerConfig),
  [WarehousingType.selectedPlacements]: createSelectionReducer(selectPlacementReducerConfig),
  [WarehousingType.options]: reducer
});

const inventoriesActionTypes = configForWarehousingEntity(WarehousingType.inventories, [
  ActionTypes.load,
  ActionTypes.loadComplete,
  ActionTypes.error
]);

const readyToReturnActionTypes = configForWarehousingEntity(WarehousingType.readyToReturn, [
  ActionTypes.load,
  ActionTypes.loadComplete,
  ActionTypes.error
]);

const returnedItemsActionTypes = configForWarehousingEntity(WarehousingType.returnedItems, [
  ActionTypes.load,
  ActionTypes.loadComplete,
  ActionTypes.error
]);

const itemsInStorageActionTypes = configForWarehousingEntity(WarehousingType.itemsInStorage, [
  ActionTypes.load,
  ActionTypes.loadComplete,
  ActionTypes.error
]);

const storageUsageActionTypes = configForWarehousingEntity(WarehousingType.storageUsage, [
  ActionTypes.load,
  ActionTypes.loadComplete,
  ActionTypes.error
]);

const toReturnDisposeJobsActionTypes = configForWarehousingEntity(WarehousingType.toReturnDisposeJobs, [
  ActionTypes.load,
  ActionTypes.loadComplete,
  ActionTypes.error
]);

const returnedDisposedJobsActionTypes = configForWarehousingEntity(WarehousingType.returnedDisposedJobs, [
  ActionTypes.load,
  ActionTypes.loadComplete,
  ActionTypes.error
]);

const warehouseInfo = configForWarehousingEntity(WarehousingType.warehouseInfo, [
  ActionTypes.load,
  ActionTypes.loadComplete,
  ActionTypes.error
]);

const jobsNewInventory = configForWarehousingEntity(WarehousingType.jobsNewInventory, [
  ActionTypes.load,
  ActionTypes.loadComplete,
  ActionTypes.error
]);

const storageSpaces = configForWarehousingEntity(WarehousingType.storageSpaces, [
  ActionTypes.load,
  ActionTypes.loadComplete,
  ActionTypes.error
]);

export const getInventories = (locationId: number | null, filters: IGetInventoriesFilters, page?: number) =>
  createAsyncAction(
    inventoriesActionTypes[ActionTypes.load],
    inventoriesActionTypes[ActionTypes.loadComplete],
    inventoriesActionTypes[ActionTypes.error],
    () => WarehousingService.getInventories(locationId, filters, page)
  );

export const getStorageItems = (locationId: number | null, filters: IItemsInStorageFitlers, page?: number) =>
  createAsyncAction(
    itemsInStorageActionTypes[ActionTypes.load],
    itemsInStorageActionTypes[ActionTypes.loadComplete],
    itemsInStorageActionTypes[ActionTypes.error],
    () => WarehousingService.getStorageItems(locationId, filters, page)
  );

export const getReadyToReturn = (locationId: number | null, page?: number, jobId?: number | null) =>
  createAsyncAction(
    readyToReturnActionTypes[ActionTypes.load],
    readyToReturnActionTypes[ActionTypes.loadComplete],
    readyToReturnActionTypes[ActionTypes.error],
    () => WarehousingService.getReadyToReturn(locationId, page, jobId)
  );

export const getReturned = (locationId: number | null, filters: IReturnedDisposed, page?: number) =>
  createAsyncAction(
    returnedItemsActionTypes[ActionTypes.load],
    returnedItemsActionTypes[ActionTypes.loadComplete],
    returnedItemsActionTypes[ActionTypes.error],
    () => WarehousingService.getReturned(locationId, filters, page)
  );

export const getStorageUsage = (locationId: number, page?: number) =>
  createAsyncAction(
    storageUsageActionTypes[ActionTypes.load],
    storageUsageActionTypes[ActionTypes.loadComplete],
    storageUsageActionTypes[ActionTypes.error],
    () => WarehousingService.getStorageUsage(locationId, page)
  );

export const getToReturnJobs = (locationId: number | null, page?: number) =>
  createAsyncAction(
    toReturnDisposeJobsActionTypes[ActionTypes.load],
    toReturnDisposeJobsActionTypes[ActionTypes.loadComplete],
    toReturnDisposeJobsActionTypes[ActionTypes.error],
    () => WarehousingService.getToReturnDisposeJobs(locationId, page)
  );

export const getToReturnedJobs = (locationId: number | null, page?: number) =>
  createAsyncAction(
    returnedDisposedJobsActionTypes[ActionTypes.load],
    returnedDisposedJobsActionTypes[ActionTypes.loadComplete],
    returnedDisposedJobsActionTypes[ActionTypes.error],
    () => WarehousingService.getReturnedDisposedJobs(locationId, page)
  );

export const getWarehouseInfo = (locationId: number | null) =>
  createAsyncAction(
    warehouseInfo[ActionTypes.load],
    warehouseInfo[ActionTypes.loadComplete],
    warehouseInfo[ActionTypes.error],
    () => WarehousingService.getWarehouseInfo(locationId)
  );

export const getJobsNewInventory = (locationId: number, searchString?: string | null, page?: number) =>
  createAsyncAction(
    jobsNewInventory[ActionTypes.load],
    jobsNewInventory[ActionTypes.loadComplete],
    jobsNewInventory[ActionTypes.error],
    () => JobService.getJobsNewInventory(locationId, searchString, page)
  );

export const getStorageSpaces = () =>
  createAsyncAction(
    storageSpaces[ActionTypes.load],
    storageSpaces[ActionTypes.loadComplete],
    storageSpaces[ActionTypes.error],
    () => WarehousingService.getStorageSpaces()
  );

export const setOptions = (options: IWarehousingOptions) =>
  createSyncAction<IWarehousingOptions>(SET_LOCATION, options);

function selectEntity(state: IAppState, warhousingEntity: WarehousingType) {
  return state.warehousing[warhousingEntity];
}

export function selectInventories(state: IAppState) {
  return selectEntity(state, WarehousingType.inventories);
}

export function selectOptions(state: IAppState) {
  return selectEntity(state, WarehousingType.options);
}

const selectionGroupCreators = createSelectActionsCreators(selectGroupReducerConfig);

export const toggleGroupSelection = (group: IPlacementGrouped) => selectionGroupCreators.toggle(group.id);

const selectionPlacementActionCreators = createSelectActionsCreators(selectPlacementReducerConfig);

export const togglePlacementSelection = (placement: IPlacement) =>
  selectionPlacementActionCreators.toggleEntity({
    itemId: placement.inventory_item.id,
    containerId: placement.container.id
  });
