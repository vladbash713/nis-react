export interface IGetInventoriesFilters {
  job_id?: number | null;
  status?: string;
}

export interface IItemsInStorageFitlers {
  job_id?: number | null;
  status?: string;
}

export interface IReturnedDisposed {
  job_id?: number | null;
  item_name?: string | null;
  storage_location?: number | null;
  status?: string;
}
