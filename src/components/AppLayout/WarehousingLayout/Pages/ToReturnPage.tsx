import * as React from 'react';
import Moment from 'react-moment';
import {compose, Action} from 'redux';
import {connect} from 'react-redux';
import {IAppState} from 'src/redux';
import {withRouter, RouteComponentProps} from 'react-router';
import {ThunkDispatch} from 'redux-thunk';
import {
  getReadyToReturn,
  getToReturnJobs,
  selectOptions,
  IWarehousingOptions,
  IWarehousingReadyToReturnState,
  IWarehousingInventoryJobsState
} from 'src/redux/warehousingDucks';
import Pagination from 'src/components/Tables/Pagination';
import PageContent from 'src/components/Layout/PageContent';
import {IInventory, IInventoryItem, InventoryStatuses} from 'src/models/IInventory';
import DropdownMenuControl, {IMenuItem} from 'src/components/Layout/MenuItems/DropdownMenuControl';
import UserContext, {IUserContext} from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';
import {IconName} from 'src/components/Icon/Icon';
import {RigthAlignedMenu} from 'src/components/AppLayout/WarehousingLayout/Accessories/AdditionalTableElements';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import ColorPalette from 'src/constants/ColorPalette';
import FilterBar, {IFilter} from 'src/components/AppLayout/WarehousingLayout/Partials/FilterBar';
import {FRONTEND_DATE} from 'src/constants/Date';
import {TextHeader, NumericHeader} from 'src/components/Tables/DataGridHeader';
import {TextCell} from 'src/components/Tables/DataGridCell';
import {
  InventoryTable,
  InventoryJobHeader,
  InventoryContent,
  PaginationContent
} from '../Accessories/ToReturnComponents';
import {ILocation} from 'src/models/IAddress';
import {openModal} from 'src/redux/modalDucks';
import InventoriesService from 'src/services/InventoriesService';
import {LinkTr} from 'src/components/Tables/PseudoTableItems';

interface IParams {}

export interface IToReturnPageProps {
  dispatch: ThunkDispatch<any, any, Action>;
  inventories: IWarehousingReadyToReturnState;
  toReturnDisposeJobs: IWarehousingInventoryJobsState;
  locationId: number | null;
  warehousingOptions: IWarehousingOptions;
  locations: ILocation[];
}

export interface IToReturnPageState {
  jobId: number | null;
  status: string;
}

type IProps = RouteComponentProps<IParams> & IToReturnPageProps;

class ToReturnPage extends React.Component<IProps, IToReturnPageState> {
  public state = {
    jobId: null,
    status: ''
  };

  public componentDidMount() {
    this.getInventories();
  }

  public componentDidUpdate(prevProps: IToReturnPageProps, prevState: IToReturnPageState) {
    const {warehousingOptions} = this.props;
    if (
      warehousingOptions &&
      prevProps.warehousingOptions &&
      warehousingOptions.selectedLocation !== null &&
      warehousingOptions.selectedLocation !== prevProps.warehousingOptions.selectedLocation
    ) {
      this.getInventories();
    }
  }

  private getInventories = (page?: number) => {
    const {dispatch, warehousingOptions} = this.props;
    const location = warehousingOptions.selectedLocation || this.primaryLocation();

    if (location) {
      dispatch(getReadyToReturn(location, page, this.state.jobId));
      dispatch(getToReturnJobs(location, page));
    }
  };

  private primaryLocation = () => {
    const loc = this.props.locations.find(l => !!l.primary);
    return loc ? loc.id : null;
  };

  private renderInventoryTable(context: IUserContext) {
    const inventories = this.filterByState(this.props.inventories.data!.data);
    if (!inventories) {
      return null;
    }
    return inventories.map((inventory: IInventory) => (
      <InventoryTable className="table">
        <thead>
          <tr>
            <InventoryJobHeader scope="col">
              <div>#{inventory.job_number}</div>
            </InventoryJobHeader>
            <TextHeader scope="col">{inventory.address}</TextHeader>
            <TextHeader scope="col" width="10%">
              Qty
            </TextHeader>
            <TextHeader scope="col" width="15%">
              Current Location
            </TextHeader>
            <TextHeader scope="col" width="15%">
              Status
            </TextHeader>
            <TextHeader scope="col" width="15%">
              Status Changed
            </TextHeader>
            <NumericHeader scope="col" width="5%">
              &nbsp;
            </NumericHeader>
          </tr>
        </thead>
        <tbody>{this.renderInventoryItems(inventory.items, context)}</tbody>
      </InventoryTable>
    ));
  }

  private renderInventoryItems(items: IInventoryItem[], context: IUserContext) {
    if (!items) {
      return null;
    }
    return items.map((item: IInventoryItem) => {
      const restMenuItems = this.getRestMenuItems(context, item);
      return (
        <LinkTr key={item.id} to={`/operations/warehousing/inventory/item/${item.id}/details`}>
          <TextCell colSpan={2}>{item.name}</TextCell>
          <TextCell>{item.quantity}</TextCell>
          <TextCell>{item.customer_location}</TextCell>
          <TextCell>{item.current_status.status}</TextCell>
          <TextCell>
            <Moment format={FRONTEND_DATE}>{item.updated_at}</Moment>
          </TextCell>
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
    });
  }

  private goToEdit = (id: any) => () => {
    this.props.history.push(`/operations/warehousing/inventory/item/${id}/details`);
  };

  private removeInventoryItem = (inventoryItem: IInventoryItem) => async () => {
    const {dispatch} = this.props;

    const res = await dispatch(openModal('Confirm', `Delete inventory item ${inventoryItem.id}?`));
    if (res) {
      InventoriesService.removeInventoryItem(inventoryItem.id).then(() => {
        this.getInventories();
      });
      return null;
    } else {
      console.log('no');
      return Promise.reject(true);
    }
  };

  private getRestMenuItems = (context: IUserContext, inventoryItem: IInventoryItem) => {
    const menuItems: IMenuItem[] = [];

    if (context.has(Permission.OPERATIONS_INVENTORY_MANAGE)) {
      menuItems.push({name: 'Edit', onClick: this.goToEdit(inventoryItem.id)});
    }
    if (context.has(Permission.OPERATIONS_INVENTORY_MANAGE)) {
      menuItems.push({name: 'Delete', onClick: this.removeInventoryItem(inventoryItem)});
    }
    if (menuItems.length === 2) {
      menuItems.splice(1, 0, {type: 'divider'});
    }
    return menuItems;
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

    let jobs: any[] = [];
    const inventoriesData = this.props.toReturnDisposeJobs.data;
    if (inventoriesData && inventoriesData.data.length > 0) {
      jobs = inventoriesData.data.map(job => ({
        value: job.job_id,
        label: job.job_number
      }));
    }

    statuses.unshift(defaultStatus);
    jobs.unshift(defaultJob);

    return [
      {
        label: 'Job Number',
        filterKey: 'jobNumber',
        options: jobs,
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
        this.setState({status: event.value});
        break;
      case 'jobNumber':
        this.setState({jobId: event.value}, () => {
          this.getInventories(1);
        });
        break;
      default:
        break;
    }
  };

  private filterByState = (inventories: IInventory[]): IInventory[] => {
    if (this.state.status) {
      inventories = inventories.filter(inventory => inventory.status === this.state.status);
    }

    return inventories;
  };

  private handlePagination = (page: number) => {
    return this.getInventories(page);
  };

  public render() {
    const {loading} = this.props.inventories;
    const inventoriesData = this.props.inventories.data;
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
  inventories: state.warehousing.readyToReturn,
  toReturnDisposeJobs: state.warehousing.toReturnDisposeJobs,
  warehousingOptions: selectOptions(state),
  locations: state.user.locations
});

export default compose<React.ComponentClass<{}>>(
  connect(mapStateToProps),
  withRouter
)(ToReturnPage);
