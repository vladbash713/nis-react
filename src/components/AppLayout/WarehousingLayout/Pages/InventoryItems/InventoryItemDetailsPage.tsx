import React from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import ReactTooltip from 'react-tooltip';
import {matchPath, RouteComponentProps, withRouter} from 'react-router-dom';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import {IconName} from 'src/components/Icon/Icon';
import FullSidebarMenuItem from 'src/components/SidebarMenu/FullSidebarMenuItem';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import UserContext from 'src/components/AppLayout/UserContext';
import ScrollableContainer from 'src/components/Layout/ScrollableContainer';
import FullSidebarMenu from 'src/components/SidebarMenu/FullSidebarMenu';
import {IInventoryItemInfo} from 'src/models/IInventories';
import InventoriesService from 'src/services/InventoriesService';
import {IInventory} from 'src/models/IInventories';
import DropdownMenuControl from 'src/components/Layout/MenuItems/DropdownMenuControl';
import {ColoredDiv} from 'src/components/Layout/Common/StyledComponents';
import ColoredIcon from 'src/components/Icon/ColoredIcon';
import {IMenuItem} from 'src/components/Layout/MenuItems/DropdownMenuControl';
import InlineSelect from 'src/components/Form/InlineSelect';
import JobService from 'src/services/JobService';
// import UserService from 'src/services/UserService';
import {openModal} from 'src/redux/modalDucks';
import PhotosList from './Photos';
import {IPhoto} from 'src/models/IPhoto';
import ScanToModal from './Modals/ScanToModal';

const statusList = [
  {value: 'In-Progress', label: 'In-Progress'},
  {value: 'Restorable', label: 'Restorable'},
  {value: 'Non-Restorable', label: 'Non-Restorable'},
  {value: 'Awaiting Disposal Authority', label: 'Awaiting Disposal Authority'},
  {value: 'Ready For Return', label: 'Ready For Return'},
  {value: 'Ready To Dispose', label: 'Ready To Dispose'},
  {value: 'Disposed', label: 'Disposed'},
  {value: 'Client Picked Up', label: 'Client Picked Up'}
];

const customSelectStyles1 = {
  container: (base: React.CSSProperties) => ({
    ...base,
    flexBasis: '150px',
    height: '33.5px',
    border: 'none',
    fontWeight: 'lighter',
    fontSize: '1rem',
    borderRadius: '0.25rem',
    boxShadow: '0 0 0 !important',
    lineHeight: '1.5rem',
    paddingTop: 0
  }),
  singleValue: (base: React.CSSProperties) => ({
    ...base,
    background: '#F7F7F7',
    color: ColorPalette.black0
  }),
  control: (base: React.CSSProperties) => ({
    ...base,
    border: 'none',
    boxShadow: 'none',
    background: '#F7F7F7',
    color: ColorPalette.black0,
    minHeight: 'auto',
    maxHeight: '33.5px !important'
  }),
  placeholder: (base: React.CSSProperties) => ({
    ...base,
    color: ColorPalette.gray2
  }),
  dropdownIndicator: (base: React.CSSProperties) => ({
    ...base,
    color: '#A3A3A3',
    padding: '6px'
  })
};

const SubHeader = styled.div`
  padding: 9px 25px 9px 26px;
  border-bottom: 1px solid #d3dbde;
`;

const Title = styled.div`
  font-weight: 700;
  font-size: 1.15rem;
  color: #1d1d1d;
`;

const ItemAndLocation = styled.div`
  display: flex;
  justify-content: space-around;
`;

const Photos = styled.div`
  margin: 0 40px;
  border-top: 2px solid #d3dbde;
  padding-top: 30px;
`;

const Item = styled.div`
  display: flex;
  width: 60%;
  margin: 40px;
  flex-direction: column;
`;

const ItemRow = styled.div`
  display: flex;
  justify-content: space-between;
  &.customer-location {
    padding-top: 30px;
    border-top: 1px solid #d3dbde;
  }
`;

const Location = styled.div`
  display: flex;
  width: 30%;
  margin: 40px;
  flex-direction: column;
`;

const Label = styled.div`
  font-size: 20px;
  color: #1d1d1d;
  margin-bottom: 30px;
`;

const InputLabel = styled.div`
  font-size: 14px;
  color: #95989a;
  margin-bottom: 7px;
`;

const Input = styled.input`
  background-color: #f7f7f7;
  border-radius: 4px;
  border: none;
  width: 100%;
  padding: 0.375rem 0.75rem;
  min-height: 33.5px;
`;

const InputContainer = styled.div`
  width: 48%;
  &.des-container {
    width: 68%;
  }
  &.quality-container {
    width: 28%;
  }
  &.location-container {
    width: 100%;
  }
  margin-bottom: 30px;
`;

const Btn = styled.button`
  font-weight: lighter;
  border-color: #42a6e6;
  box-shadow: 0 0 0 !important;

  padding: 5px 12px;
  color: #3498db;
  cursor: pointer;
  border-radius: 0.25rem;
  font-size: 1rem;
  margin: 0 10px;
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const HeaderSub = styled.div`
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 1.15rem;
  color: #959595;
`;

const Options = styled(DropdownMenuControl)`
  background-color: #3498db;
  padding: 3px 12px 8px 12px;
  border-radius: 0.25rem;
  font-size: 1rem;
  font-weight: lighter;
`;

const Info = styled.div`
  font-size: 16px;
  color: #909698;
  margin-left: 31px;
`;

const SortTrigger = styled(ColoredDiv)`
  cursor: pointer;
`;

const StatusLabel = styled.div`
  background-color: #f5aa00;
  border-radius: 3px;
  padding: 2px 10px;
  color: white;
  margin-right: 10px;
  font-size: 16px;
`;

interface IParams {
  type: string;
  id?: string;
}

interface IConnectProps {
  dispatch: (params?: any) => Promise<any> | void;
}

interface IState {
  loading: boolean;
  data: IInventoryItemInfo | any;
  inventory: IInventory | any;
  jobs: any;
  locations: any;
  locationEdit: boolean;
  selectedPhotos: IPhoto[];
  containers: any[];
  showScan: boolean;
}

type IProps = RouteComponentProps<IParams>;

class InventoryItemDetailsPage extends React.PureComponent<IProps & IConnectProps, IState> {
  public state = {
    loading: true,
    data: {},
    inventory: {},
    jobs: [],
    locations: [],
    locationEdit: false,
    selectedPhotos: [],
    containers: [],
    showScan: false
  };

  componentDidMount() {
    this.getData();
  }

  private showScanModal = () => {
    this.setState({showScan: true});
  };

  private getData = () => {
    const inventoryItemId = Number(this.props.match.params.id);
    InventoriesService.getInventoryItem(inventoryItemId).then(res => {
      InventoriesService.getInventoryInfo(res.data.inventory_id).then(info => {
        // Promise.all([JobService.getAllJobs({}), UserService.getLocations()]).then(pres => {
        //   this.setState({data: res.data, inventory: info.data, jobs: pres[0].data, locations: pres[1], loading: false});
        // });
        Promise.all([
          JobService.getAllJobs({}),
          InventoriesService.getContainers(),
          InventoriesService.getSpaces()
        ]).then(pres => {
          this.setState({
            data: res.data,
            inventory: info.data,
            jobs: pres[0].data,
            containers: pres[1].data,
            locations: pres[2].data,
            loading: false
          });
        });
      });
    });
  };

  private getMenuItems(): any[] {
    const id = this.props.match.params.id;
    return [
      {
        path: `/operations/warehousing/inventory/item/${id}/details`,
        label: 'Details',
        icon: IconName.CashFileIcon,
        isActive: this.isActive(`/operations/warehousing/inventory/item/${id}/details`)
      },
      {
        path: `/operations/warehousing/inventory/item/${id}/notes-work`,
        label: 'Notes and Work',
        icon: IconName.FileEdit,
        isActive: this.isActive(`/operations/warehousing/inventory/item/${id}/notes-work`)
      }
    ];
  }

  private isActive(path: string) {
    return !!matchPath(this.props.location.pathname, {path});
  }

  private removeInventoryItem = async () => {
    const {dispatch} = this.props;
    const {inventory} = this.state;
    const inventory_id = inventory ? (inventory as IInventoryItemInfo).id : '';

    const res = await dispatch(openModal('Confirm', `Delete inventory item?`));
    if (res) {
      const inventoryItemId = Number(this.props.match.params.id);
      InventoriesService.removeInventoryItem(inventoryItemId).then(() => {
        this.props.history.push(`/operations/warehousing/inventory/${inventory_id}/items`);
      });
      return null;
    } else {
      console.log('no');
      return Promise.reject(true);
    }
  };

  private markStatus = (status: string) => () => {
    const inventory = this.state.data;
    const current_status = inventory ? (inventory as IInventoryItemInfo).current_status : '';
    InventoriesService.markInventoryItemStatus(current_status.inventory_item_id, current_status.user_id, status).then(
      res => {
        let inventoryObj: IInventoryItemInfo = Object.assign({}, inventory);
        let current_status = inventory ? (inventory as IInventoryItemInfo).current_status : '';
        current_status = res.data.inventory_item.current_status;
        inventoryObj.current_status = current_status;
        this.setState({data: inventoryObj});
      }
    );
  };

  private getItems = (): IMenuItem[] => {
    let arr: any[] = [];
    statusList.forEach(status => {
      arr.push({
        name: status.label,
        onClick: this.markStatus(status.label)
      });
    });

    arr.push({
      type: 'divider'
    });

    arr = arr.concat([
      {
        name: 'Delete',
        onClick: this.removeInventoryItem
      }
    ]);

    let arr1: any[] = [
      // {
      //   name: 'Edit item number',
      //   onClick: () => {}
      // },
      {
        name: 'Manually select location',
        onClick: this.enableLocationEdit
      },
      // {
      //   name: 'Add note',
      //   onClick: () => {},
      //   classNames: 'option-border'
      // },
      {
        name: 'Upload a photo',
        onClick: this.fileClick
      },
      {
        name: 'Print',
        onClick: () => {}
      }
    ];

    arr1.push({
      type: 'divider'
    });

    return arr1.concat(arr);
  };

  private fileClick = () => {
    let input: any = document.getElementById('file-input');
    input.click();
  };

  private enableLocationEdit = () => {
    this.setState({locationEdit: true});
  };

  private renderTrigger = () => {
    return (
      <SortTrigger className="d-flex align-items-center" margin="5px 0 0 0">
        <ColoredDiv color={ColorPalette.white} margin="0 5px 0 0">
          Options
        </ColoredDiv>
        <ColoredIcon name={IconName.ArrowDown} color={ColorPalette.white} size={16} />
      </SortTrigger>
    );
  };

  private updateInfo = (field: string) => (e: any) => {
    const {data, inventory} = this.state;
    if (data) {
      let newData: IInventoryItemInfo = Object.assign({}, data);
      if (field === 'job_number') {
        newData['job_id'] = e.value;
        const jobs = this.state.jobs;
        jobs.forEach((job: any) => {
          if (e.value === job.id) {
            newData['job_number'] = `${job.id}-${job.assigned_location.code}`;
          }
        });
      } else {
        newData[field] = e.target.value;
      }
      this.setState({data: newData});

      const id = newData ? (newData as IInventoryItemInfo).id : '';
      const inventory_id = inventory ? (inventory as IInventoryItemInfo).id : '';
      const job_id = newData ? (newData as IInventoryItemInfo).job_id : '';
      const identifier = newData ? (newData as IInventoryItemInfo).identifier : '';
      const name = newData ? (newData as IInventoryItemInfo).name : '';
      const quantity = newData ? (newData as IInventoryItemInfo).quantity : '';
      const condition = newData ? (newData as IInventoryItemInfo).condition : '';
      const serial_number = newData ? (newData as IInventoryItemInfo).serial_number : '';
      const model = newData ? (newData as IInventoryItemInfo).model : '';
      const customer_location = newData ? (newData as IInventoryItemInfo).customer_location : '';
      const assessment_fee = newData ? (newData as IInventoryItemInfo).assessment_fee : '';
      const estimated_replacement_cost = newData ? (newData as IInventoryItemInfo).estimated_replacement_cost : '';
      const restoration_cost = newData ? (newData as IInventoryItemInfo).restoration_cost : '';
      const restoration_hours = newData ? (newData as IInventoryItemInfo).restoration_hours : '';
      const inventory_item_standard_type_id = newData
        ? (newData as IInventoryItemInfo).inventory_item_standard_type_id
        : '';

      InventoriesService.updateInventoryItem(id, {
        inventory_id: inventory_id || '',
        job_id: job_id || '',
        identifier: identifier || '',
        name: name || '',
        quantity: quantity || '',
        condition: condition || '',
        serial_number: serial_number || '',
        model: model || '',
        customer_location: customer_location || '',
        assessment_fee: assessment_fee || '',
        estimated_replacement_cost: estimated_replacement_cost || '',
        restoration_cost: restoration_cost || '',
        restoration_hours: restoration_hours || '',
        inventory_item_standard_type_id: inventory_item_standard_type_id || ''
      });
    }
  };

  private getJobNumberOptions() {
    const jobs = this.state.jobs;
    let options: any[] = [];
    jobs.forEach((job: any) => {
      options.push({value: job.id, label: `${job.id}-${job.assigned_location.code}`});
    });
    return options;
  }

  private getLocationOptions() {
    const locations = this.state.locations;
    let options: any[] = [];
    locations.forEach((location: any) => {
      options.push({value: location.id, label: location.location.name});
    });
    return options;
  }

  private getContainerOptions() {
    const containers = this.state.containers;
    let options: any[] = [];
    containers.forEach((container: any) => {
      options.push({value: container.id, label: container.label});
    });
    return options;
  }

  private setSelectedPhotos = (photo: IPhoto) => () => {
    let photos: IPhoto[] = this.state.selectedPhotos;
    photos.push(photo);
    this.setState({selectedPhotos: photos});
  };

  private startPlacement = (field: string) => (e: any) => {
    const inventoryItemId = Number(this.props.match.params.id);
    const {data} = this.state;
    let newData: IInventoryItemInfo = Object.assign({}, data);
    let placementD = newData.placement;
    placementD[field].id = e.value;
    newData.placement = placementD;
    this.setState({data: newData});
    InventoriesService.stopPlacement(inventoryItemId).then(() => {
      InventoriesService.startPlacement({
        inventory_item_id: inventoryItemId,
        inventory_storage_container_id: newData.placement.container.id,
        inventory_storage_space_id: newData.placement.space.id,
        is_used_on_ar: true
      });
    });
  };

  private changeLocation = (space: any) => {
    const inventoryItem: any = this.state.data;
    let newData = Object.assign({}, inventoryItem);
    newData.placement.space = space;
    this.setState({data: newData});
  };

  public render() {
    const {loading, data, inventory, locations, locationEdit, selectedPhotos, containers, showScan} = this.state;
    const name = data ? (data as IInventoryItemInfo).name : '';
    const quantity = data ? (data as IInventoryItemInfo).quantity : '';
    const job_id = data ? (data as IInventoryItemInfo).job_id : '';
    const customer_location = data ? (data as IInventoryItemInfo).customer_location : '';
    const serial_number = data ? (data as IInventoryItemInfo).serial_number : '';
    const model = data ? (data as IInventoryItemInfo).model : '';
    const status_obj = data ? (data as IInventoryItemInfo).current_status : null;
    const status = status_obj ? (status_obj as any).status : '';
    const inventoryItemId = data ? (data as IInventoryItemInfo).id : '';
    const inventoryItemName = data ? (data as IInventoryItemInfo).name : '';
    const inventoryAddress = inventory ? (inventory as IInventory).address || 'Unknown' : '';
    const inventoryJobNumber = inventory ? (inventory as IInventory).job_number : '';
    const selectedJobNum = data ? (data as IInventoryItemInfo).job_number : '';
    const placement = data ? (data as IInventoryItemInfo).placement : '';
    const selectedLocationId = placement ? placement.space.id : '';
    let selectedLocationLabel = '';
    locations.forEach((location: any) => {
      if (location.id === selectedLocationId) {
        selectedLocationLabel = location.location.name;
      }
    });
    const selectedLocation = {value: selectedLocationId, label: selectedLocationLabel};

    const selectedContainerId = placement ? placement.container.id : '';
    let selectedContainerLabel = '';
    containers.forEach((container: any) => {
      if (container.id === selectedContainerId) {
        selectedContainerLabel = container.label;
      }
    });
    const selectedContainer = {value: selectedContainerId, label: selectedContainerLabel};
    const selectedJobNumOption = {value: job_id, label: selectedJobNum};
    const photos = data ? (data as IInventoryItemInfo).photos : '';

    return (
      <UserContext.Consumer>
        {context => (
          <div className="d-flex h-100 flex-column align-items-stretch">
            <ReactTooltip className="overlapping" effect="solid" place="right" />
            <SubHeader className="d-flex flex-row justify-content-between">
              <HeaderSub>
                <Title>{`Inventory Item #${inventoryItemId || ''}`}</Title>
                {!loading && <Info>{`${inventoryAddress} | ${inventoryJobNumber}`}</Info>}
              </HeaderSub>
              <HeaderSub>
                {!loading && <StatusLabel>{status}</StatusLabel>}
                <Btn onClick={this.showScanModal}>Scan To...</Btn>
                <Btn onClick={() => this.props.history.push(`/job/${job_id}/details`)}>View Job</Btn>
                <Options items={this.getItems()} noMargin={true} direction="right" trigger={this.renderTrigger} />
              </HeaderSub>
            </SubHeader>
            <div className="d-flex flex-row align-items-stretch" style={{height: 'calc(100% - 52px)'}}>
              <FullSidebarMenu>
                {this.getMenuItems().map((item: any) => (
                  <FullSidebarMenuItem key={item.label} item={item} />
                ))}
              </FullSidebarMenu>
              <div className="flex-grow-1 position-relative">
                {loading && <BlockLoading size={40} color={ColorPalette.white} />}
                <ScrollableContainer className="h-100">
                  <ItemAndLocation>
                    <Item>
                      <Label>Item</Label>
                      <ItemRow>
                        <InputContainer className="des-container">
                          <InputLabel>Description</InputLabel>
                          <Input value={name} onChange={this.updateInfo('name')} />
                        </InputContainer>
                        <InputContainer className="quality-container">
                          <InputLabel>Quantity</InputLabel>
                          <Input value={quantity} onChange={this.updateInfo('quantity')} />
                        </InputContainer>
                      </ItemRow>
                      <ItemRow>
                        <InputContainer>
                          <InputLabel>Serial No.</InputLabel>
                          <Input value={serial_number} onChange={this.updateInfo('serial_number')} />
                        </InputContainer>
                        <InputContainer>
                          <InputLabel>Model</InputLabel>
                          <Input value={model} onChange={this.updateInfo('model')} />
                        </InputContainer>
                      </ItemRow>
                      <ItemRow className="customer-location">
                        <InputContainer>
                          <InputLabel>Customer Location</InputLabel>
                          <Input value={customer_location} onChange={this.updateInfo('customer_location')} />
                        </InputContainer>
                        <InputContainer>
                          <InputLabel>Job Number</InputLabel>
                          <InlineSelect
                            value={selectedJobNumOption}
                            options={this.getJobNumberOptions()}
                            onChange={this.updateInfo('job_number')}
                            customStyles={customSelectStyles1}
                          />
                        </InputContainer>
                      </ItemRow>
                    </Item>
                    <Location>
                      <Label>Location</Label>
                      <InputContainer className="location-container">
                        <InputLabel>Location</InputLabel>
                        <InlineSelect
                          value={selectedLocation}
                          options={this.getLocationOptions()}
                          onChange={this.startPlacement('space')}
                          customStyles={customSelectStyles1}
                          isDisabled={!locationEdit}
                        />
                      </InputContainer>
                      <InputContainer className="location-container">
                        <InputLabel>Box/Pallet</InputLabel>
                        <InlineSelect
                          value={selectedContainer}
                          options={this.getContainerOptions()}
                          onChange={this.startPlacement('container')}
                          customStyles={customSelectStyles1}
                          isDisabled={!locationEdit}
                        />
                      </InputContainer>
                    </Location>
                  </ItemAndLocation>
                  <Photos>
                    <Label>Photos</Label>
                    <PhotosList
                      photos={{data: photos, selectedPhotos}}
                      setSelectedPhotos={this.setSelectedPhotos}
                      itemId={inventoryItemId}
                      loadPhotos={this.getData}
                      itemName={inventoryItemName}
                    />
                  </Photos>
                  <ScanToModal
                    closeModal={() => this.setState({showScan: false})}
                    modalIsOpen={showScan}
                    spaces={locations}
                    count={1}
                    selectedInventoryItems={[data]}
                    changeLocation={this.changeLocation}
                  />
                </ScrollableContainer>
              </div>
            </div>
          </div>
        )}
      </UserContext.Consumer>
    );
  }
}

export default compose<React.ComponentClass<{}>>(
  connect(),
  withRouter
)(InventoryItemDetailsPage);

export const InternalInventoryItemDetailsPage = InventoryItemDetailsPage;
