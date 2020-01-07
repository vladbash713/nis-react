import * as React from 'react';
import {compose, Action} from 'redux';
import {connect} from 'react-redux';
import {IAppState} from 'src/redux';
import {withRouter, RouteComponentProps} from 'react-router';
import {ThunkDispatch} from 'redux-thunk';
import {
  getInventories,
  selectOptions,
  IWarehousingOptions,
  IWarehousingInventoriesState
} from 'src/redux/warehousingDucks';
import {FinancePseudoTable} from 'src/components/Tables/FinanceListTable';
import {THead, Tr, TBody, Td, Th, LinkTr} from 'src/components/Tables/PseudoTableItems';
import Pagination from 'src/components/Tables/Pagination';
import PageContent from 'src/components/Layout/PageContent';
import {IInventory, InventoryStatuses} from 'src/models/IInventory';
import DropdownMenuControl, {IMenuItem} from 'src/components/Layout/MenuItems/DropdownMenuControl';
import UserContext, {IUserContext} from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';
import {IconName} from 'src/components/Icon/Icon';
import {
  AddressColumn,
  RigthAlignedMenu,
  BolderHeader
} from 'src/components/AppLayout/WarehousingLayout/Accessories/AdditionalTableElements';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import ColorPalette from 'src/constants/ColorPalette';
import FilterBar, {IFilter} from 'src/components/AppLayout/WarehousingLayout/Partials/FilterBar';
import {openModal} from 'src/redux/modalDucks';
import {ILocation} from 'src/models/IAddress';
import {IWrappedSelectOption} from 'src/components/Form/Select';
import {IGetInventoriesFilters} from 'src/models/IWarehousingFilters';
import InventoriesService from 'src/services/InventoriesService';
import {ColoredDiv} from 'src/components/Layout/Common/StyledComponents';

interface IParams {}

export interface IInventoriesPageProps {
  dispatch: ThunkDispatch<any, any, Action>;
  inventories: IWarehousingInventoriesState;
  locationId: number | null;
  warehousingOptions: IWarehousingOptions;
  locations: ILocation[];
}

export interface IInventoriesPageState {
  jobId: number | null;
  status: string;
  jobNumber: string;
}

type IProps = RouteComponentProps<IParams> & IInventoriesPageProps;

class InventoriesPage extends React.Component<IProps, IInventoriesPageState> {
  public state = {
    jobId: null,
    status: '',
    jobNumber: ''
  };

  public componentDidMount() {
    this.getInventories();
  }

  public componentDidUpdate(prevProps: IInventoriesPageProps, prevState: IInventoriesPageState) {
    const {warehousingOptions} = this.props;
    if (
      warehousingOptions &&
      prevProps.warehousingOptions &&
      warehousingOptions.selectedLocation !== null &&
      warehousingOptions.selectedLocation !== prevProps.warehousingOptions.selectedLocation
    ) {
      this.getInventories({
        job_id: this.state.jobId,
        status: this.state.status
      });
    }
  }

  private getInventories = (filters?: IGetInventoriesFilters, page?: number) => {
    const {dispatch, warehousingOptions} = this.props;
    const location = warehousingOptions.selectedLocation || this.primaryLocation();

    if (location) {
      dispatch(getInventories(location, filters || {}, page));
    }
  };

  private primaryLocation = () => {
    const loc = this.props.locations.find(l => !!l.primary);
    return loc ? loc.id : null;
  };

  private renderNoInventories(context: IUserContext) {
    return (
      <Tr>
        <div className="no-items">No Inventories...</div>
      </Tr>
    );
  }

  private renderInventoriesRows(context: IUserContext) {
    const inventories = this.props.inventories.data!.data;

    if (!inventories || inventories.length === 0) {
      return this.renderNoInventories(context);
    }
    return inventories.map((inventory: IInventory) => {
      const restMenuItems = this.getRestMenuItems(context, inventory);
      return (
        <LinkTr to={`/operations/warehousing/inventory/${inventory.id}/items`} key={inventory.id}>
          <Td>
            <AddressColumn>{inventory.address || 'Unknown'}</AddressColumn>
          </Td>
          <Td>#{inventory.job_number}</Td>
          <Td>{inventory.items_count} items</Td>
          <Td>{inventory.status}</Td>
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

  private getRestMenuItems = (context: IUserContext, inventory: IInventory) => {
    const menuItems: IMenuItem[] = [];

    if (context.has(Permission.OPERATIONS_INVENTORY_MANAGE)) {
      menuItems.push({name: 'Items', onClick: this.goToItems(inventory.id)});
    }
    if (context.has(Permission.OPERATIONS_INVENTORY_MANAGE)) {
      menuItems.push({name: 'Delete', onClick: this.removeInventory(inventory)});
    }
    if (menuItems.length === 2) {
      menuItems.splice(1, 0, {type: 'divider'});
    }
    return menuItems;
  };

  private goToItems = (id: any) => () => {
    this.props.history.push(`/operations/warehousing/inventory/${id}/items`);
  };

  private removeInventory = (inventory: IInventory) => async () => {
    const {dispatch} = this.props;

    const res = await dispatch(
      openModal(
        'Confirm',
        `Delete inventory ${inventory.id}?`,
        <ColoredDiv style={{marginTop: '50px'}}>
          You are able to delete this inventory and all associates inventory items. This action can not be un-done.
        </ColoredDiv>
      )
    );
    InventoriesService.deleteInventory(inventory.id).then(() => {
      this.getInventories();
    });
    if (res) {
      return null;
    } else {
      return Promise.reject(true);
    }
  };

  private getJobNumberOptions() {
    if (this.props.inventories.data) {
      let inventories = this.props.inventories.data!.data;
      const options: IWrappedSelectOption[] = [{value: '', label: 'All'}];
      inventories.forEach(inventory => {
        options.push({value: inventory.job_id.toString(), label: inventory.job_number});
      });
      inventories = inventories.filter((item, index) => inventories.indexOf(item) === index);
      return options;
    } else {
      return [];
    }
  }

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
        options: this.getJobNumberOptions(),
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
          this.getInventories({
            job_id: this.state.jobId,
            status: this.state.status
          });
        });
        break;
      case 'jobNumber':
        this.setState({jobId: event.value}, () => {
          this.getInventories({
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
    return this.getInventories(
      {
        job_id: this.state.jobId,
        status: this.state.status
      },
      page
    );
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
            <FinancePseudoTable className="table">
              <THead>
                <Tr>
                  <Th>
                    <BolderHeader>Inventories</BolderHeader>
                  </Th>
                  <Th />
                  <Th />
                  <Th />
                  <Th />
                </Tr>
              </THead>
              <TBody>{hasData ? this.renderInventoriesRows(context) : this.renderNoInventories(context)}</TBody>
            </FinancePseudoTable>
            {inventoriesData && inventoriesData.pagination && inventoriesData.pagination.last_page > 1 && (
              <Pagination pagination={inventoriesData.pagination} onChange={this.handlePagination} />
            )}
          </PageContent>
        )}
      </UserContext.Consumer>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  inventories: state.warehousing.inventories,
  warehousingOptions: selectOptions(state),
  locations: state.user.locations
});

export default compose<React.ComponentClass<{}>>(
  connect(mapStateToProps),
  withRouter
)(InventoriesPage);
