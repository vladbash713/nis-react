import * as React from 'react';
import {compose, Action} from 'redux';
import {connect} from 'react-redux';
import {IAppState} from 'src/redux';
import {withRouter, RouteComponentProps} from 'react-router';
import UserContext, {IUserContext} from 'src/components/AppLayout/UserContext';
import PageContent from 'src/components/Layout/PageContent';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import ColorPalette from 'src/constants/ColorPalette';
import FilterBar, {IFilter} from 'src/components/AppLayout/WarehousingLayout/Partials/FilterBar';
import {FinancePseudoTable} from 'src/components/Tables/FinanceListTable';
import {
  RigthAlignedMenu,
  BolderHeader
} from 'src/components/AppLayout/WarehousingLayout/Accessories/AdditionalTableElements';
import {THead, Tr, TBody, Th, Td, LinkTr} from 'src/components/Tables/PseudoTableItems';
import Pagination from 'src/components/Tables/Pagination';
import {
  getReturned,
  selectOptions,
  getToReturnedJobs,
  IWarehousingOptions,
  IWarehousingReturnedState,
  IWarehousingInventoryJobsState
} from 'src/redux/warehousingDucks';
import {ThunkDispatch} from 'redux-thunk';
import DropdownMenuControl, {IMenuItem} from 'src/components/Layout/MenuItems/DropdownMenuControl';
import Permission from 'src/constants/Permission';
import {IconName} from 'src/components/Icon/Icon';
import {IReturnedItems} from 'src/models/IReturnedItems';
import Moment from 'react-moment';
import {FRONTEND_DATE} from 'src/constants/Date';
import {InventoryItemStatusesReturned} from 'src/models/IInventory';
import {ILocation} from 'src/models/IAddress';
import {IReturnedDisposed} from 'src/models/IWarehousingFilters';
import {openModal} from 'src/redux/modalDucks';
import InventoriesService from 'src/services/InventoriesService';

interface IParams {}

export interface IReturnedPageProps {
  dispatch: ThunkDispatch<any, any, Action>;
  warehousingOptions: IWarehousingOptions;
  returnedItems: IWarehousingReturnedState;
  locations: ILocation[];
  returnedDisposedJobs: IWarehousingInventoryJobsState;
}

export interface IReturnedPageState {
  jobId: number | null;
  status: string;
}

type IProps = RouteComponentProps<IParams> & IReturnedPageProps;

class ReturnedPage extends React.Component<IProps, IReturnedPageState> {
  public state = {
    jobId: null,
    status: ''
  };

  public componentDidMount() {
    this.getReturnedItems();
  }

  public componentDidUpdate(prevProps: IReturnedPageProps, prevState: IReturnedPageState) {
    const {warehousingOptions} = this.props;
    if (
      warehousingOptions &&
      prevProps.warehousingOptions &&
      warehousingOptions.selectedLocation !== null &&
      warehousingOptions.selectedLocation !== prevProps.warehousingOptions.selectedLocation
    ) {
      this.getReturnedItems({
        job_id: this.state.jobId,
        status: this.state.status
      });
    }
  }

  private getReturnedItems = (filters?: IReturnedDisposed, page?: number) => {
    const {dispatch, warehousingOptions} = this.props;
    const location = warehousingOptions.selectedLocation || this.primaryLocation();

    if (location) {
      dispatch(getReturned(location, filters || {}, page));
      dispatch(getToReturnedJobs(location));
    }
  };

  private primaryLocation = () => {
    const loc = this.props.locations.find(l => !!l.primary);
    return loc ? loc.id : null;
  };

  private renderReturnedItemsRows(context: IUserContext) {
    const returnedItems = this.props.returnedItems.data!.data;

    if (!returnedItems) {
      return null;
    }
    return returnedItems.map((item: IReturnedItems, index) => {
      const restMenuItems = this.getRestMenuItems(context, item);
      return (
        <LinkTr key={index} to={`/operations/warehousing/inventory/${item.id}/items`}>
          <Td>{item.name}</Td>
          <Td>
            #{item.inventory.job_number} | {item.inventory.address}
          </Td>
          <Td>{item.quantity}</Td>
          <Td>{item.status}</Td>
          <Td>
            <Moment format={FRONTEND_DATE}>{item.current_status.created_at}</Moment>
          </Td>
          <Td>
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
          </Td>
        </LinkTr>
      );
    });
  }

  private goToItems = (id: any) => () => {
    this.props.history.push(`/operations/warehousing/inventory/${id}/items`);
  };

  private removeInventory = (inventory: any) => async () => {
    const {dispatch} = this.props;

    const res = await dispatch(openModal('Confirm', `Delete inventory ${inventory.id}?`));
    InventoriesService.deleteInventory(inventory.id).then(() => {
      this.getReturnedItems();
    });
    if (res) {
      return null;
    } else {
      return Promise.reject(true);
    }
  };

  private getRestMenuItems = (context: IUserContext, item: IReturnedItems) => {
    const menuItems: IMenuItem[] = [];

    if (context.has(Permission.OPERATIONS_INVENTORY_MANAGE)) {
      menuItems.push({name: 'Edit', onClick: this.goToItems(item.id)});
    }
    if (context.has(Permission.OPERATIONS_INVENTORY_MANAGE)) {
      menuItems.push({name: 'Delete', onClick: this.removeInventory(item)});
    }
    if (menuItems.length === 2) {
      menuItems.splice(1, 0, {type: 'divider'});
    }
    return menuItems;
  };

  private getFilters = (): IFilter[] => {
    const defaultStatus = {value: '', label: 'All'};
    const defaultJob = {value: '', label: 'All Jobs'};
    const defaultItemName = {value: '', label: 'All'};
    const statuses = Object.keys(InventoryItemStatusesReturned).map(key => {
      return {
        value: InventoryItemStatusesReturned[key],
        label: InventoryItemStatusesReturned[key]
      };
    });

    statuses.unshift(defaultStatus);

    let jobs: any[] = [];
    const inventoriesData = this.props.returnedDisposedJobs.data;
    if (inventoriesData && inventoriesData.data.length > 0) {
      jobs = inventoriesData.data.map(job => ({
        value: job.job_id,
        label: job.job_number
      }));
    }
    jobs.unshift(defaultJob);

    return [
      {
        label: 'Item name',
        filterKey: 'itemName',
        options: [],
        defaultValue: defaultItemName,
        type: 'text'
      },
      {
        label: 'Job Number',
        filterKey: 'jobNumber',
        options: jobs,
        defaultValue: defaultJob
      },
      {
        label: 'Storage Location',
        filterKey: 'storageLocation',
        options: [],
        defaultValue: defaultItemName
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
    console.log('al???', label, event);

    switch (label) {
      case 'status':
        this.setState({status: event.value}, () => {
          console.log('Filter value', event.value);
          console.log('Component state', this.state);
          this.getReturnedItems({
            job_id: this.state.jobId,
            status: this.state.status
          });
        });
        break;
      case 'jobNumber':
        this.setState({jobId: event.value}, () => {
          this.getReturnedItems({
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
    return this.getReturnedItems(
      {
        job_id: this.state.jobId,
        status: this.state.status
      },
      page
    );
  };

  public render() {
    const {loading} = this.props.returnedItems;
    const returnedItemsData = this.props.returnedItems.data;
    const hasData = returnedItemsData && returnedItemsData.data.length > 0;
    console.log('To return props', this.props);
    return (
      <UserContext.Consumer>
        {context => (
          <PageContent>
            {loading && <BlockLoading size={40} color={ColorPalette.white} />}
            <FilterBar filters={this.getFilters()} handleChange={this.handleFilter} />
            <FinancePseudoTable className="table">
              <THead>
                <Tr>
                  <Th>
                    <BolderHeader>Item</BolderHeader>
                  </Th>
                  <Th>Job</Th>
                  <Th>Qty</Th>
                  <Th>Status</Th>
                  <Th>Status changed</Th>
                  <Th />
                </Tr>
              </THead>
              <TBody>{hasData ? this.renderReturnedItemsRows(context) : null}</TBody>
            </FinancePseudoTable>
            {returnedItemsData && returnedItemsData.pagination && returnedItemsData.pagination.last_page > 1 && (
              <Pagination pagination={returnedItemsData.pagination} onChange={this.handlePagination} />
            )}
          </PageContent>
        )}
      </UserContext.Consumer>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  returnedItems: state.warehousing.returnedItems,
  warehousingOptions: selectOptions(state),
  locations: state.user.locations,
  returnedDisposedJobs: state.warehousing.returnedDisposedJobs
});

export default compose<React.ComponentClass<{}>>(
  connect(mapStateToProps),
  withRouter
)(ReturnedPage);
