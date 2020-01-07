import * as React from 'react';
import {compose, Action} from 'redux';
import {connect} from 'react-redux';
import {IAppState} from 'src/redux';
import {withRouter, RouteComponentProps} from 'react-router';
import {
  getStorageUsage,
  selectOptions,
  IWarehousingStorageUsage,
  IWarehousingOptions
} from 'src/redux/warehousingDucks';
import {ThunkDispatch} from 'redux-thunk';
import UserContext, {IUserContext} from 'src/components/AppLayout/UserContext';
import PageContent from 'src/components/Layout/PageContent';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import ColorPalette from 'src/constants/ColorPalette';
import {IStorageType, ISpace} from 'src/models/IStorage';
import {
  InventoryTable,
  InventoryJobHeader,
  InventoryContent,
  PaginationContent
} from '../Accessories/ToReturnComponents';
import {TextHeader} from 'src/components/Tables/DataGridHeader';
// import DropdownMenuControl, {IMenuItem} from 'src/components/Layout/MenuItems/DropdownMenuControl';
// import Permission from 'src/constants/Permission';
import {TextCell} from 'src/components/Tables/DataGridCell';
import Moment from 'react-moment';
// import {RigthAlignedMenu} from 'src/components/AppLayout/WarehousingLayout/Accessories/AdditionalTableElements';
// import {IconName} from 'src/components/Icon/Icon';
import FilterBar, {IFilter} from 'src/components/AppLayout/WarehousingLayout/Partials/FilterBar';
import Pagination from 'src/components/Tables/Pagination';
import {ILocation} from 'src/models/IAddress';

interface IParams {}

export interface IStorageLocationsPageProps {
  dispatch: ThunkDispatch<any, any, Action>;
  storageUsage: IWarehousingStorageUsage;
  warehousingOptions: IWarehousingOptions;
  locations: ILocation[];
}

export interface IStorageLocationsPageState {}

type IProps = RouteComponentProps<IParams> & IStorageLocationsPageProps;

class StorageLocationsPage extends React.Component<IProps, IStorageLocationsPageState> {
  public componentDidMount() {
    this.getStorageUsage();
  }

  public componentDidUpdate(prevProps: IStorageLocationsPageProps, prevState: IStorageLocationsPageState) {
    const {warehousingOptions} = this.props;
    if (
      warehousingOptions &&
      warehousingOptions.selectedLocation &&
      prevProps.warehousingOptions &&
      warehousingOptions.selectedLocation !== null &&
      warehousingOptions.selectedLocation !== prevProps.warehousingOptions.selectedLocation
    ) {
      this.getStorageUsage();
    }
  }

  private getStorageUsage = (page?: number) => {
    const {dispatch, warehousingOptions} = this.props;
    const location = warehousingOptions.selectedLocation || this.primaryLocation();

    if (location) {
      dispatch(getStorageUsage(location, page));
    }
  };

  private primaryLocation = () => {
    const loc = this.props.locations.find(l => !!l.primary);
    return loc ? loc.id : null;
  };

  private renderStorageUsageTable(context: IUserContext) {
    const storageUsage = this.props.storageUsage.data!.data;
    if (!storageUsage) {
      return null;
    }
    return storageUsage.map((storageType: IStorageType) => (
      <InventoryTable className="table">
        <thead>
          <tr>
            <InventoryJobHeader scope="col">
              <div>{storageType.name}</div>
            </InventoryJobHeader>
            <TextHeader scope="col" width="10%">
              Days Used
            </TextHeader>
            <TextHeader scope="col" width="15%">
              Occupied Status
            </TextHeader>
            {/* <NumericHeader scope="col" width="5%">
              &nbsp;
            </NumericHeader> */}
          </tr>
        </thead>
        <tbody>{this.renderTableItems(storageType.spaces, context)}</tbody>
      </InventoryTable>
    ));
  }

  private renderTableItems(spaces: ISpace[], context: IUserContext) {
    // const restMenuItems = this.getRestMenuItems(context);

    if (!spaces) {
      return null;
    }

    return spaces.map((space: ISpace) => (
      <tr key={space.id}>
        <TextCell>{space.name}</TextCell>
        <TextCell>
          <Moment fromNow={true} ago={true}>
            {space.created_at}
          </Moment>
        </TextCell>
        <TextCell>{space.status}</TextCell>
        {/* <td>
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
        </td> */}
      </tr>
    ));
  }

  // private getRestMenuItems = (context: IUserContext) => {
  //   const menuItems: IMenuItem[] = [];

  //   if (context.has(Permission.OPERATIONS_INVENTORY_MANAGE)) {
  //     menuItems.push({name: 'Edit', onClick: undefined});
  //   }
  //   if (context.has(Permission.OPERATIONS_INVENTORY_MANAGE)) {
  //     menuItems.push({name: 'Delete', onClick: undefined});
  //   }
  //   if (menuItems.length === 2) {
  //     menuItems.splice(1, 0, {type: 'divider'});
  //   }
  //   return menuItems;
  // };

  private getFilters = (): IFilter[] => {
    const defaultStorageLocation = {value: '', label: 'All items'};
    const defaultOccupiedStatus = {value: '', label: 'All'};

    const storageLocations: any[] = [];
    const statuses: any[] = [];

    storageLocations.unshift(defaultStorageLocation);
    statuses.unshift(defaultOccupiedStatus);

    return [
      {
        label: 'Storage Location',
        filterKey: 'storageLocation',
        options: storageLocations,
        defaultValue: defaultStorageLocation
      },
      {
        label: 'Occupied Status',
        filterKey: 'occupiedStatus',
        options: statuses,
        defaultValue: defaultOccupiedStatus
      }
    ];
  };

  private handleFilter = (label: string, event: any) => {
    switch (label) {
      case 'storageLocation':
        break;
      case 'occupiedStatus':
        break;
      default:
        break;
    }
  };

  private handlePagination = (page: number) => {
    return this.getStorageUsage(page);
  };

  public render() {
    const {loading} = this.props.storageUsage;
    const storageUsageData = this.props.storageUsage.data;
    const hasData = storageUsageData && storageUsageData.data.length > 0;

    return (
      <UserContext.Consumer>
        {context => (
          <PageContent>
            {loading && <BlockLoading size={40} color={ColorPalette.white} />}
            <FilterBar filters={this.getFilters()} handleChange={this.handleFilter} />
            <InventoryContent className="d-flex flex-column">
              {hasData ? this.renderStorageUsageTable(context) : null}
            </InventoryContent>
            {storageUsageData && storageUsageData.pagination && storageUsageData.pagination.last_page > 1 && (
              <PaginationContent>
                <Pagination pagination={storageUsageData.pagination} onChange={this.handlePagination} />
              </PaginationContent>
            )}
          </PageContent>
        )}
      </UserContext.Consumer>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  storageUsage: state.warehousing.storageUsage,
  warehousingOptions: selectOptions(state),
  locations: state.user.locations
});

export default compose<React.ComponentClass<{}>>(
  connect(mapStateToProps),
  withRouter
)(StorageLocationsPage);
