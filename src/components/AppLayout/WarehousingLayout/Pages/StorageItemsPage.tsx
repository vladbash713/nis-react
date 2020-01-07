import * as React from 'react';
import {compose, Action} from 'redux';
import {connect} from 'react-redux';
import {IAppState} from 'src/redux';
import {withRouter, RouteComponentProps} from 'react-router';
import {ThunkDispatch} from 'redux-thunk';
import {
  getStorageItems,
  selectOptions,
  IWarehousingOptions,
  IWarehousingStoragesState,
  togglePlacementSelection,
  toggleGroupSelection
} from 'src/redux/warehousingDucks';
import Pagination from 'src/components/Tables/Pagination';
import PageContent from 'src/components/Layout/PageContent';
import {InventoryStatuses} from 'src/models/IInventory';
import DropdownMenuControl, {IMenuItem} from 'src/components/Layout/MenuItems/DropdownMenuControl';
import UserContext, {IUserContext} from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';
import {IconName} from 'src/components/Icon/Icon';
import {RigthAlignedMenu} from 'src/components/AppLayout/WarehousingLayout/Accessories/AdditionalTableElements';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import ColorPalette from 'src/constants/ColorPalette';
import FilterBar, {IFilter} from 'src/components/AppLayout/WarehousingLayout/Partials/FilterBar';
import {TextHeader, NumericHeader} from 'src/components/Tables/DataGridHeader';
import {TextCell} from 'src/components/Tables/DataGridCell';
import {
  InventoryTable,
  InventoryJobHeader,
  InventoryContent,
  PaginationContent,
  CheckBoxCell,
  CheckBoxHeader
} from '../Accessories/ToReturnComponents';
import CheckboxSimple from 'src/components/Form/CheckboxSimple';
import {IPlacement, IPlacementGrouped} from 'src/models/IPlacement';
import Moment from 'react-moment';
import {ILocation} from 'src/models/IAddress';
import {IItemsInStorageFitlers} from 'src/models/IWarehousingFilters';
import {openModal} from 'src/redux/modalDucks';
import InventoriesService from 'src/services/InventoriesService';
import {LinkTr} from 'src/components/Tables/PseudoTableItems';

interface IParams {}

export interface IStorageItemsPageProps {
  dispatch: ThunkDispatch<any, any, Action>;
  storageItems: IWarehousingStoragesState;
  selectedGroup: number[];
  selectedPlacements: any[];
  locationId: number | null;
  warehousingOptions: IWarehousingOptions;
  locations: ILocation[];
}

export interface IStorageItemsPageState {
  jobId: number | null;
  status: string;
}

type IProps = RouteComponentProps<IParams> & IStorageItemsPageProps;

class StorageItemsPage extends React.Component<IProps, IStorageItemsPageState> {
  public state = {
    jobId: null,
    status: ''
  };

  public componentDidMount() {
    this.getStorageItems();
  }

  public componentDidUpdate(prevProps: IStorageItemsPageProps, prevState: IStorageItemsPageState) {
    const {warehousingOptions} = this.props;
    if (
      warehousingOptions &&
      prevProps.warehousingOptions &&
      warehousingOptions.selectedLocation !== null &&
      warehousingOptions.selectedLocation !== prevProps.warehousingOptions.selectedLocation
    ) {
      this.getStorageItems({
        job_id: this.state.jobId,
        status: this.state.status
      });
    }
  }

  private togglePlacement = (placement: IPlacement) => {
    this.props.dispatch(togglePlacementSelection(placement));
  };

  private toggleGroup = (group: IPlacementGrouped) => {
    const {dispatch, selectedPlacements, selectedGroup} = this.props;

    dispatch(toggleGroupSelection(group));
    group.placements.map(placement => {
      if (
        (!this.containsObject(
          {
            itemId: placement.inventory_item.id,
            containerId: placement.container.id
          },
          selectedPlacements
        ) &&
          !selectedGroup.includes(placement.inventory_storage_container_id)) ||
        !selectedPlacements ||
        selectedPlacements.length === 0
      ) {
        dispatch(togglePlacementSelection(placement));
      }
    });
  };

  private groupIsSelected = (id: number) => {
    const {selectedGroup} = this.props;
    if (selectedGroup && selectedGroup.length > 0) {
      return selectedGroup.includes(id);
    }
    return false;
  };

  private placementIsSelected = (id: number, containerId: number) => {
    const {selectedPlacements} = this.props;
    if (selectedPlacements && selectedPlacements.length > 0) {
      return this.containsObject({itemId: id, containerId}, selectedPlacements);
    }
    return false;
  };

  private containsObject = (obj: any, list: any[]) => {
    let i;
    for (i = 0; i < list.length; i++) {
      if (list[i].itemId === obj.itemId && list[i].containerId === obj.containerId) {
        return true;
      }
    }
    return false;
  };

  private getStorageItems = (filters?: IItemsInStorageFitlers, page?: number) => {
    const {dispatch, warehousingOptions} = this.props;
    const location = warehousingOptions.selectedLocation || this.primaryLocation();

    if (location) {
      dispatch(getStorageItems(location, filters || {}, page));
    }
  };

  private primaryLocation = () => {
    const loc = this.props.locations.find(l => !!l.primary);
    return loc ? loc.id : null;
  };

  private renderInventoryTable(context: IUserContext) {
    const storageItems = this.groupEntitiesByField(
      this.props.storageItems.data!.data,
      'inventory_storage_container_id'
    );
    if (!storageItems) {
      return null;
    }

    return storageItems.map((placementGroup: IPlacementGrouped) => (
      <InventoryTable className="table">
        <thead>
          <tr>
            <CheckBoxHeader scope="col" width="5%">
              <CheckboxSimple
                value={this.groupIsSelected(placementGroup.id)}
                onChange={(data: any) => this.toggleGroup(placementGroup)}
                size={18}
              />
            </CheckBoxHeader>
            <InventoryJobHeader scope="col" width="20%">
              <div>{placementGroup.container_label}</div>
            </InventoryJobHeader>
            <TextHeader scope="col">Job</TextHeader>
            <TextHeader scope="col" width="20%">
              Days in Location
            </TextHeader>
            <TextHeader scope="col" width="20%">
              Status
            </TextHeader>
            <NumericHeader scope="col" width="5%">
              &nbsp;
            </NumericHeader>
          </tr>
        </thead>
        <tbody>{this.renderInventoryItems(placementGroup.placements, context)}</tbody>
      </InventoryTable>
    ));
  }

  private renderInventoryItems(placements: IPlacement[], context: IUserContext) {
    if (!placements) {
      return null;
    }
    return placements.map((placement: IPlacement) => {
      const restMenuItems = this.getRestMenuItems(context, placement);
      if (placement.inventory_item) {
        return (
          <LinkTr key={placement.id} to={`/operations/warehousing/inventory/item/${placement.id}/details`}>
            <CheckBoxCell>
              <CheckboxSimple
                value={this.placementIsSelected(placement.inventory_item.id, placement.container.id)}
                onChange={(data: any) => this.togglePlacement(placement)}
                size={18}
              />
            </CheckBoxCell>
            <TextCell>{placement.inventory_item.name}</TextCell>
            <TextCell>#{placement.inventory_item.job!.claim_number}</TextCell>
            <TextCell>
              <Moment fromNow={true} ago={true}>
                {placement.started_at}
              </Moment>
            </TextCell>
            <TextCell>Unknown</TextCell>
            <td>
              {restMenuItems.length > 0 && (
                <RigthAlignedMenu>
                  <DropdownMenuControl
                    items={restMenuItems}
                    noMargin={true}
                    direction="right"
                    iconName={IconName.MenuVertical}
                  />
                </RigthAlignedMenu>
              )}
            </td>
          </LinkTr>
        );
      } else {
        return null;
      }
    });
  }

  private goToEdit = (id: any) => () => {
    this.props.history.push(`/operations/warehousing/inventory/item/${id}/details`);
  };

  private removeInventoryItem = (item: IPlacement) => async () => {
    const {dispatch} = this.props;

    const res = await dispatch(openModal('Confirm', `Delete inventory item ${item.inventory_item_id}?`));
    if (res) {
      InventoriesService.removeInventoryItem(item.inventory_item_id).then(() => {
        this.getStorageItems();
      });
      return null;
    } else {
      console.log('no');
      return Promise.reject(true);
    }
  };

  private getRestMenuItems = (context: IUserContext, item: IPlacement) => {
    const menuItems: IMenuItem[] = [];

    if (context.has(Permission.OPERATIONS_INVENTORY_MANAGE)) {
      menuItems.push({name: 'Edit', onClick: this.goToEdit(item.inventory_item_id)});
    }
    if (context.has(Permission.OPERATIONS_INVENTORY_MANAGE)) {
      menuItems.push({name: 'Delete', onClick: this.removeInventoryItem(item)});
    }
    if (menuItems.length === 2) {
      menuItems.splice(1, 0, {type: 'divider'});
    }
    return menuItems;
  };

  private groupEntitiesByField = (collection: IPlacement[], property: string) => {
    let i = 0;
    let val;
    let index;
    const values = [];
    const result: any = [];
    for (; i < collection.length; i++) {
      val = collection[i][property];
      index = values.indexOf(val);
      if (index > -1) {
        result[index].placements.push(collection[i]);
      } else {
        values.push(val);
        result.push({
          id: collection[i].id,
          container_label: collection[i].container.label,
          placements: [collection[i]]
        });
      }
    }
    return result;
  };

  private getFilters = (): IFilter[] => {
    const defaultStatus = {value: '', label: 'All'};
    const defaultJob = {value: '', label: 'All Jobs'};
    const statuses = Object.keys(InventoryStatuses).map(key => {
      return {
        value: InventoryStatuses[key],
        label: InventoryStatuses[key]
      };
    });

    statuses.unshift(defaultStatus);

    return [
      {
        label: 'Job Number',
        filterKey: 'jobNumber',
        options: [],
        defaultValue: defaultJob
      },
      {
        label: 'Status',
        filterKey: 'status',
        options: statuses,
        defaultValue: defaultStatus
      }
    ];
  };

  private handleFilter = (label: string, event: any) => {
    switch (label) {
      case 'status':
        this.setState({status: event.value}, () => {
          this.getStorageItems({
            job_id: this.state.jobId,
            status: this.state.status
          });
        });
        break;

      default:
        break;
    }
  };

  private handlePagination = (page: number) => {
    return this.getStorageItems(
      {
        job_id: this.state.jobId,
        status: this.state.status
      },
      page
    );
  };

  public render() {
    const {loading} = this.props.storageItems;
    const inventoriesData = this.props.storageItems.data;
    const hasData = inventoriesData && inventoriesData.data.length > 0;

    return (
      <UserContext.Consumer>
        {context => (
          <PageContent>
            {loading && <BlockLoading size={40} color={ColorPalette.white} />}
            <FilterBar filters={this.getFilters()} handleChange={this.handleFilter} />
            <InventoryContent className="d-flex flex-column">
              {hasData ? this.renderInventoryTable(context) : null}
            </InventoryContent>
            {inventoriesData && inventoriesData.pagination && inventoriesData.pagination.last_page > 1 && (
              <PaginationContent>
                <Pagination pagination={inventoriesData.pagination} onChange={this.handlePagination} />
              </PaginationContent>
            )}
          </PageContent>
        )}
      </UserContext.Consumer>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  storageItems: state.warehousing.itemsInStorage,
  selectedGroup: state.warehousing.selectedGroup,
  selectedPlacements: state.warehousing.selectedPlacements,
  warehousingOptions: selectOptions(state),
  locations: state.user.locations
});

export default compose<React.ComponentClass<{}>>(
  connect(mapStateToProps),
  withRouter
)(StorageItemsPage);
