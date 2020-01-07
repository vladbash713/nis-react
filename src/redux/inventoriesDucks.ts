import {reduxWrap, IReturnType} from './reduxWrap';
import {Dispatch} from 'redux';
import InventoriesService, {IInventoriesSuccess} from 'src/services/InventoriesService';

const LOAD = 'Steamatic/Warehouse/Inventories/LOAD';
const LOAD_COMPLETE = 'Steamatic/Warehouse/Inventories/LOAD_COMPLETE';
const RESET = 'Steamatic/Warehouse/Inventories/RESET';
const ERROR = 'Steamatic/Warehouse/Inventories/ERROR';

export type InventoriesStateType = IReturnType<IInventoriesSuccess>;

export default reduxWrap<IInventoriesSuccess>({
  load: LOAD,
  loadComplete: LOAD_COMPLETE,
  reset: RESET,
  error: ERROR
});

export const getInventories = (locationID: any) => {
  return async (dispatch: Dispatch) => {
    dispatch({type: LOAD});
    try {
      const response = await InventoriesService.getInventoryListByLocationID(locationID);
      dispatch({type: LOAD_COMPLETE, payload: response});
    } catch (err) {
      dispatch({type: ERROR, payload: err});
      throw err;
    }
  };
};
