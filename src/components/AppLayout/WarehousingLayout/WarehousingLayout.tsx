import * as React from 'react';
import {IAppState} from 'src/redux';
import {connect} from 'react-redux';
import {compose, Action} from 'redux';
import UserContext from 'src/components/AppLayout/UserContext';
import ScrollableContainer from 'src/components/Layout/ScrollableContainer';
import {IconName} from 'src/components/Icon/Icon';
import {matchPath, withRouter, RouteComponentProps, Switch, Route} from 'react-router';
import InventoriesPage from 'src/components/AppLayout/WarehousingLayout/Pages/InventoriesPage';
import ReturnedPage from 'src/components/AppLayout/WarehousingLayout/Pages/ReturnedPage';
import StorageItemsPage from 'src/components/AppLayout/WarehousingLayout/Pages/StorageItemsPage';
import StorageLocationsPage from 'src/components/AppLayout/WarehousingLayout/Pages/StorageLocationsPage';
import ToReturnPage from 'src/components/AppLayout/WarehousingLayout/Pages/ToReturnPage';
import styled from 'styled-components';
import WarehousingMenu from 'src/components/SidebarMenu/WarehousingMenu';
import FullSidebarMenuItem, {IMenuItem} from 'src/components/SidebarMenu/FullSidebarMenuItem';
import WarehousingHeader from 'src/components/AppLayout/WarehousingLayout/WarehousingHeader';
import {ILocation} from 'src/models/IAddress';
import {setOptions, IWarehousingOptions, IWarehousingInfoState} from 'src/redux/warehousingDucks';
import {ThunkDispatch} from 'redux-thunk';
import {selectOptions, getWarehouseInfo} from 'src/redux/warehousingDucks';

const PageWrapper = styled.div`
  position: relative;
`;

interface IParams {}

export interface IWarehousingLayoutProps {
  locations: ILocation[];
  dispatch: ThunkDispatch<any, any, Action>;
  warehousingOptions: IWarehousingOptions;
  warehouseInfo: IWarehousingInfoState;
}

export interface IWarehousingLayoutState {
  searchLoading: boolean;
  location: ILocation | null;
  locationId: null | number;
}

type IProps = RouteComponentProps<IParams> & IWarehousingLayoutProps;

class WarehousingInventoriesLayout extends React.Component<IProps, IWarehousingLayoutState> {
  public state = {
    searchLoading: false,
    location: null,
    locationId: null
  };

  public setLocationId = (locationId: number) => {
    this.setState({
      locationId
    });
    this.updateLocation(locationId);
  };

  private isActive(path: string) {
    return !!matchPath(this.props.location.pathname, {path});
  }

  private updateLocation = (locationId: number) => {
    const {dispatch} = this.props;
    dispatch(setOptions({selectedLocation: locationId}));
    if (locationId) {
      this.getWarehouseInfo(locationId);
    }
  };

  private getWarehouseInfo = (locationId: number | null) => {
    const {dispatch} = this.props;
    if (locationId) {
      dispatch(getWarehouseInfo(locationId));
    }
  };

  private getLocationRedux = (): number => {
    const {warehousingOptions} = this.props;
    return warehousingOptions && warehousingOptions.selectedLocation
      ? warehousingOptions.selectedLocation
      : this.primaryLocation
      ? this.primaryLocation.id
      : 0;
  };

  public componentDidMount() {
    this.setState({locationId: this.getLocationRedux()}, () => {
      this.getWarehouseInfo(this.getLocationRedux());
    });
  }

  public componentDidUpdate(prevProps: IWarehousingLayoutProps, prevState: IWarehousingLayoutState) {
    if (!prevState.locationId && prevProps.locations.length !== this.props.locations.length) {
      this.setState({locationId: this.primaryLocation ? this.primaryLocation.id : 0});
      this.updateLocation(this.getLocationRedux());
    }
  }

  private get primaryLocation() {
    return this.props.locations.find(l => !!l.primary);
  }

  private getWIMenuItems(): IMenuItem[] {
    const {warehouseInfo} = this.props;
    const counters = warehouseInfo.data ? warehouseInfo.data!.data : [];

    return [
      {
        path: '/operations/warehousing/inventories',
        icon: IconName.ArrowThickCircleRight,
        isActive: this.isActive('/operations/warehousing/inventories'),
        label: 'Inventories',
        value: 0,
        type: 'inventories'
      },
      {
        path: '/operations/warehousing/items',
        icon: IconName.ShipmentUpload,
        isActive: this.isActive('/operations/warehousing/items'),
        label: 'Items in Storage',
        value: 0,
        type: 'items_in_storage'
      },
      {
        path: '/operations/warehousing/locations',
        icon: IconName.WarehouseStorage,
        isActive: this.isActive('/operations/warehousing/locations'),
        label: 'Storage Locations',
        value: 0,
        type: 'storage_location_usage'
      },
      {
        path: '/operations/warehousing/to-return',
        icon: IconName.Truck,
        isActive: this.isActive('/operations/warehousing/to-return'),
        label: 'Ready to Return / Dispose',
        value: 0,
        type: 'ready_to_return_dispose'
      },
      {
        path: '/operations/warehousing/returned',
        icon: IconName.ShipmentDeliver,
        isActive: this.isActive('/operations/warehousing/returned'),
        label: 'Returned / Disposed',
        value: 0,
        type: 'returned_disposed'
      }
    ].map((el: IMenuItem) => {
      el.value = counters[el.type!];
      return Object.assign({}, el);
    });
  }

  public render() {
    const {match, locations, location} = this.props;

    return (
      <div className="d-flex h-100 flex-column align-items-stretch">
        <WarehousingHeader
          title="Warehousing & Inventories"
          location={location}
          locations={locations}
          onLocationChange={this.setLocationId}
          locationId={this.state.locationId}
        />

        <div className="d-flex h-100 flex-row align-items-stretch">
          <WarehousingMenu>
            {this.getWIMenuItems().map((item: IMenuItem) => (
              <FullSidebarMenuItem key={item.label} item={item} />
            ))}
          </WarehousingMenu>

          <UserContext.Consumer>
            {context => {
              return (
                <div className="flex-grow-1 h-100">
                  <ScrollableContainer className="h-100">
                    <PageWrapper>
                      <Switch>
                        <Route exact={true} path={`${match.path}/inventories`} component={InventoriesPage} />
                        <Route exact={true} path={`${match.path}/items`} component={StorageItemsPage} />
                        <Route exact={true} path={`${match.path}/locations`} component={StorageLocationsPage} />
                        <Route exact={true} path={`${match.path}/to-return`} component={ToReturnPage} />
                        <Route exact={true} path={`${match.path}/returned`} component={ReturnedPage} />
                      </Switch>
                    </PageWrapper>
                  </ScrollableContainer>
                </div>
              );
            }}
          </UserContext.Consumer>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  locations: state.user.locations,
  warehousingOptions: selectOptions(state),
  warehouseInfo: state.warehousing.warehouseInfo
});

export default compose<React.ComponentClass<{}>>(
  connect(mapStateToProps),
  withRouter
)(WarehousingInventoriesLayout);
