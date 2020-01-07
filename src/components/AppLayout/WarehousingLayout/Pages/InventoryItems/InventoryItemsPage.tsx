import React from 'react';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {IAppState} from 'src/redux';
import ReactTooltip from 'react-tooltip';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import styled from 'styled-components';
import Typography from 'src/constants/Typography';
import ColorPalette from 'src/constants/ColorPalette';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import {IInventory, IInventoryItem} from 'src/models/IInventories';
import PageContent from 'src/components/Layout/PageContent';
import UserContext from 'src/components/AppLayout/UserContext';
import ScrollableContainer from 'src/components/Layout/ScrollableContainer';
import {TBody, Td, Th, THead, Tr, LinkTr} from 'src/components/Tables/PseudoTableItems';
import {PseudoTable} from 'src/components/Tables/PlainTable';
import DropdownMenuControl from 'src/components/Layout/MenuItems/DropdownMenuControl';
import InventoriesService from 'src/services/InventoriesService';
import * as _ from 'lodash';
import {IconName} from 'src/components/Icon/Icon';
import CheckboxSimple from 'src/components/Form/CheckboxSimple';
import {ColoredDiv} from 'src/components/Layout/Common/StyledComponents';
import ColoredIcon from 'src/components/Icon/ColoredIcon';
import {IMenuItem} from 'src/components/Layout/MenuItems/DropdownMenuControl';
import {openModal} from 'src/redux/modalDucks';
import moment from 'moment';
import InlineSelect from 'src/components/Form/InlineSelect';
import {ILocation} from 'src/models/IAddress';
import ScanToModal from './Modals/ScanToModal';
import ReportModal from './Modals/ReportModal';
import {CopyToClipboard} from 'react-copy-to-clipboard';

const SubHeader = styled.div`
  padding: 9px 25px 9px 26px;
  border-bottom: 1px solid #d3dbde;
`;

const Title = styled.div`
  font-weight: 700;
  font-size: 1.15rem;
  color: #1d1d1d;
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

const SortTrigger = styled(ColoredDiv)`
  cursor: pointer;
`;

const Info = styled.div`
  font-size: 16px;
  color: #909698;
  margin-left: 31px;
`;

const SubTitle = styled.div`
  font-size: 18px;
  margin: 30px 0 0 30px;
  font-weight: bold;
`;

const CheckTd = styled(Td)`
  > label {
    display: inline-block !important;
    margin: 0;
    margin-right: 5px;
    margin-bottom: -2px;
  }
`;

const InventoriesPseudoTable = styled(PseudoTable)`
  margin-bottom: 50px;
  ${Th} {
    font-weight: ${Typography.weight.bold};
    color: black !important;
  }
  ${Tr}, ${LinkTr} {
    ${CheckTd} {
      width: 40%;
    }
    ${Td} {
      .more-menu {
        float: right;
      }
    }
  }
`;

const ItemsContainer = styled.div`
  width: 60%;
`;

const SelectedNotice = styled.div`
  font-size: 16px;
  color: #909698;
  margin-right: 30px;
`;

const ItemsImage = styled.img`
  border-radius: 5px;
  margin: 0 10px;
`;

const ToggleLink = styled.a`
  color: ${ColorPalette.blue1} !important;
  cursor: pointer;
  text-decoration: none;
  font-size: 12px;
  margin-left: 10px;
  font-weight: 400;
`;

const Filter = styled.div`
  display: flex;
  padding: 0 30px;
  margin-top: 20px;
`;

const FilterOption = styled.div`
  max-width: 320px;
  min-width: 100px;
  margin-right: 30px;
  width: 30%;
  &:last-child {
    margin-right: 0px;
  }
`;

const Label = styled.div`
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

interface IOption {
  value: string | number;
  label: string;
}

interface IConnectProps {
  dispatch: (params?: any) => Promise<any> | void;
  locations: ILocation[];
}

interface IParams {
  id?: string;
}

interface IState {
  loading: boolean;
  inventory: IInventory | any;
  inventoryItems: any;
  expanded: boolean;
  selectedStatus: IOption;
  selectedLocation: IOption;
  selectedDate: IOption;
  selectedItem: string;
  showScan: boolean;
  showReportModal: boolean;
  linkReport: string;
  spaces: any[];
}

type IProps = RouteComponentProps<IParams>;

class InventoryItemsPage extends React.PureComponent<IProps & IConnectProps, IState> {
  private clipboardRef: React.RefObject<HTMLInputElement>;

  constructor(props: IProps & IConnectProps) {
    super(props);
    this.clipboardRef = React.createRef();
  }

  public state = {
    loading: true,
    inventory: {},
    inventoryItems: null,
    expanded: false,
    selectedStatus: {value: '', label: 'All'},
    selectedLocation: {value: '', label: 'All'},
    selectedDate: {value: '', label: 'All'},
    selectedItem: '',
    showScan: false,
    showReportModal: false,
    linkReport: '',
    spaces: []
  };

  public componentDidMount() {
    this.makeVisiableData();
  }

  private makeVisiableData = () => {
    const inventoryId = Number(this.props.match.params.id);
    this.getData(inventoryId).then(res => {
      let items = res[1].data;
      items.forEach((item: any) => {
        item.selected = false;
        item.updated_at = moment(item.updated_at).format('DD MMMM YYYY');
      });
      var itemsByDate = _.mapValues(_.groupBy(items, 'updated_at'), list =>
        list.map(item => _.omit(item, 'updated_at'))
      );
      this.setState({
        loading: false,
        inventory: res[0].data,
        inventoryItems: itemsByDate,
        spaces: res[2].data
      });
    });
  };

  private getData = (inventoryId: any) => {
    const requestList: Array<Promise<any>> = [
      InventoriesService.getInventoryInfo(inventoryId),
      InventoriesService.getInventoryItems(inventoryId),
      InventoriesService.getSpaces()
    ];
    return Promise.all(requestList);
  };

  private renderItems() {
    const inventoryItems: any = this.state.inventoryItems;
    if (!inventoryItems) {
      return null;
    }

    let tableList = [];
    for (let date in inventoryItems) {
      if (date === this.state.selectedDate.value || this.state.selectedDate.value === '')
        tableList.push(
          <InventoriesPseudoTable className="table" key={date}>
            <THead>
              <Tr>
                <Th>{date}</Th>
                <Th />
                <Th />
                <Th />
              </Tr>
            </THead>
            <TBody>{this.renderItemRows(inventoryItems[date])}</TBody>
          </InventoriesPseudoTable>
        );
    }
    return tableList;
  }

  private toggleSelection = (item: IInventoryItem) => () => {
    let inventoryItems: any = Object.assign({}, this.state.inventoryItems);
    for (let date in inventoryItems) {
      inventoryItems[date].forEach((inventoryItem: IInventoryItem) => {
        if (inventoryItem.id === item.id) {
          inventoryItem.selected = !inventoryItem.selected;
        }
      });
    }
    this.setState({inventoryItems});
  };

  private goToEdit = (id: any) => () => {
    this.props.history.push(`/operations/warehousing/inventory/item/${id}/details`);
  };

  private getMoreMenuItems = (inventoryItem: IInventoryItem) => {
    return [
      {name: 'Edit', onClick: this.goToEdit(inventoryItem.id)},
      {name: 'Delete', onClick: this.removeInventoryItem(inventoryItem)}
    ];
  };

  private removeInventoryItem = (inventoryItem: IInventoryItem) => async () => {
    const {dispatch} = this.props;

    const res = await dispatch(openModal('Confirm', `Delete inventory item ${inventoryItem.id}?`));
    if (res) {
      InventoriesService.removeInventoryItem(inventoryItem.id).then(() => {
        this.makeVisiableData();
      });
      return null;
    } else {
      console.log('no');
      return Promise.reject(true);
    }
  };

  private removeSelectedInventoryItem = async () => {
    const {dispatch} = this.props;

    const res = await dispatch(openModal('Confirm', `Delete inventory selected items?`));
    if (res) {
      const inventoryItems: any = this.state.inventoryItems;
      const requestList: Array<Promise<any>> = [];
      for (let date in inventoryItems) {
        inventoryItems[date].forEach((inventoryItem: IInventoryItem) => {
          if (inventoryItem.selected) {
            const {id} = inventoryItem;
            requestList.push(InventoriesService.removeInventoryItem(id));
          }
        });
      }
      Promise.all(requestList).then(() => {
        this.makeVisiableData();
      });
      return null;
    } else {
      console.log('no');
      return Promise.reject(true);
    }
  };

  private renderItemRows(items: any) {
    return items.map((item: IInventoryItem) => {
      const {selectedStatus, selectedItem, selectedLocation} = this.state;
      let show = true;
      let statusFlag = item.current_status.status === selectedStatus.value || selectedStatus.value === '';
      let spaceFlag =
        (item.placement && item.placement.space.location_id === selectedLocation.value) ||
        selectedLocation.value === '';
      show = item.name.toLowerCase().indexOf(selectedItem.toLowerCase()) !== -1 && statusFlag && spaceFlag;
      if (show) {
        return (
          <LinkTr key={item.id} to={`/operations/warehousing/inventory/item/${item.id}/details`}>
            <CheckTd>
              <CheckboxSimple
                value={item.selected}
                onChange={this.toggleSelection(item)}
                size={15}
                inversedColors={false}
              />
              {item.first_photo_url && <ItemsImage src={item.first_photo_url} />}
              {item.name}
            </CheckTd>
            <Td>{item.current_location === 'Not set' ? '' : item.current_location}</Td>
            <Td>{item.current_status.status || 'Undefined'}</Td>
            <Td>
              <DropdownMenuControl
                items={this.getMoreMenuItems(item)}
                noMargin={true}
                direction="right"
                iconName={IconName.MenuVertical}
                className="more-menu"
              />
            </Td>
          </LinkTr>
        );
      } else {
        return null;
      }
    });
  }

  private renderNoItems() {
    return (
      <Tr>
        <div className="no-items">No Items...</div>
      </Tr>
    );
  }

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

  private getItems = (): IMenuItem[] => {
    let arr: any[] = [];
    let disabled = this.getSelecetedCount() === 0;
    statusList.forEach(status => {
      arr.push({
        name: `Mark as ${status.label}`,
        onClick: this.markStatus(status.label),
        disabled
      });
    });

    arr.push({
      type: 'divider'
    });

    return arr.concat([
      {
        name: 'Get Link for Report...',
        onClick: this.reportLink
      },
      {
        name: 'Print',
        onClick: () => {},
        disabled
      },
      {
        type: 'divider'
      },
      {
        name: 'Delete',
        onClick: this.removeSelectedInventoryItem,
        disabled
      }
    ]);
  };

  private reportLink = () => {
    const inventoryId = Number(this.props.match.params.id);
    this.setState({loading: true});
    InventoriesService.getReportLink(inventoryId).then(res => {
      this.setState(
        {
          showReportModal: true,
          loading: false,
          linkReport: `${process.env.REACT_APP_URL}/operations/warehousing/inventory/${res.data.code}/report`
        },
        () => {
          const node = this.clipboardRef.current;
          if (node) {
            node.click();
          }
        }
      );
    });
  };

  private markStatus = (status: string) => () => {
    const inventoryItems: any = this.state.inventoryItems;
    const count = this.getSelecetedCount();
    if (count === 0) {
      return;
    } else {
      const requestList: Array<Promise<any>> = [];
      for (let date in inventoryItems) {
        inventoryItems[date].forEach((inventoryItem: IInventoryItem) => {
          if (inventoryItem.selected) {
            const {current_status} = inventoryItem;
            requestList.push(
              InventoriesService.markInventoryItemStatus(
                current_status.inventory_item_id,
                current_status.user_id,
                status
              )
            );
          }
        });
      }
      Promise.all(requestList).then(() => {
        this.makeVisiableData();
      });
    }
  };

  private getSelecetedCount = () => {
    const inventoryItems: any = this.state.inventoryItems;
    if (!inventoryItems) {
      return 0;
    } else {
      let count = 0;
      for (let date in inventoryItems) {
        inventoryItems[date].forEach((inventoryItem: IInventoryItem) => {
          if (inventoryItem.selected) {
            count++;
          }
        });
      }
      return count;
    }
  };

  private getSelectedItems = () => {
    const inventoryItems: any = this.state.inventoryItems;
    if (!inventoryItems) {
      return [];
    } else {
      let selected: any[] = [];
      for (let date in inventoryItems) {
        inventoryItems[date].forEach((inventoryItem: IInventoryItem) => {
          if (inventoryItem.selected) {
            selected.push(inventoryItem);
          }
        });
      }
      return selected;
    }
  };

  private toogleBar = () => {
    this.setState({expanded: !this.state.expanded});
  };

  private getLocationOptions() {
    const locations: ILocation[] = this.state.spaces;
    let options: IOption[] = [{value: '', label: 'All'}];
    locations.forEach((location: any) => {
      options.push({value: location.location_id, label: location.location.name});
    });
    return options;
  }

  private getDateOptions() {
    let inventoryItems: any = this.state.inventoryItems;
    let options: IOption[] = [{value: '', label: 'All'}];
    for (let date in inventoryItems) {
      options.push({value: date, label: date});
    }
    return options;
  }

  private setFilter = (type: string) => (option: any) => {
    if (type === 'status') {
      this.setState({selectedStatus: option});
    }
    if (type === 'location') {
      this.setState({selectedLocation: option});
    }
    if (type === 'date') {
      this.setState({selectedDate: option});
    }
    if (type === 'item') {
      this.setState({selectedItem: option.target.value});
    }
  };

  private showScanModal = () => {
    this.setState({showScan: true});
  };

  private changeLocation = (location: any) => {
    const inventoryItems: any = this.state.inventoryItems;
    let newData = Object.assign({}, inventoryItems);
    for (let date in newData) {
      newData[date].forEach((inventoryItem: IInventoryItem) => {
        inventoryItem.current_location = location.name;
      });
    }
    this.setState({inventoryItems: newData});
  };

  public render() {
    const {
      inventory,
      inventoryItems,
      loading,
      expanded,
      selectedLocation,
      selectedStatus,
      selectedDate,
      showScan,
      showReportModal,
      linkReport,
      spaces
    } = this.state;

    let inventoryId = inventory ? (inventory as IInventory).id : '';
    let inventoryAddress = inventory ? (inventory as IInventory).address : '';
    let inventoryJobNumber = inventory ? (inventory as IInventory).job_number : '';

    return (
      <UserContext.Consumer>
        {context => (
          <div className="d-flex h-100 flex-column align-items-stretch">
            <ReactTooltip className="overlapping" effect="solid" place="right" />
            <SubHeader className="d-flex flex-row justify-content-between">
              <HeaderSub>
                <Title>{`Inventory List #${inventoryId || ''}`}</Title>
                {!loading && <Info>{`${inventoryAddress || 'Unknown'} | ${inventoryJobNumber}`}</Info>}
              </HeaderSub>
              <HeaderSub>
                {this.getSelecetedCount() !== 0 && (
                  <SelectedNotice>{`${this.getSelecetedCount()} items selected`}</SelectedNotice>
                )}
                <Btn onClick={() => this.props.history.push(`/operations/warehousing/inventories`)}>Cancel</Btn>
                <Btn onClick={this.showScanModal} disabled={this.getSelecetedCount() === 0}>
                  Scan To...
                </Btn>
                <Options items={this.getItems()} noMargin={true} direction="right" trigger={this.renderTrigger} />
              </HeaderSub>
            </SubHeader>
            <div className="h-100">
              <ScrollableContainer className="h-100" style={{paddingBottom: '20px'}}>
                <ItemsContainer className="flex-grow-1 position-relative mx-auto">
                  {loading && <BlockLoading size={40} color={ColorPalette.white} />}
                  <SubTitle>
                    Items <ToggleLink onClick={this.toogleBar}>{expanded ? 'Hide Filter' : 'Show Filter'}</ToggleLink>
                  </SubTitle>
                  {expanded && (
                    <Filter>
                      <FilterOption>
                        <Label>Item</Label>
                        <Input onChange={this.setFilter('item')} />
                      </FilterOption>
                      <FilterOption>
                        <Label>Date</Label>
                        <InlineSelect
                          value={selectedDate}
                          options={this.getDateOptions()}
                          onChange={this.setFilter('date')}
                          customStyles={customSelectStyles1}
                        />
                      </FilterOption>
                      <FilterOption>
                        <Label>Location</Label>
                        <InlineSelect
                          value={selectedLocation}
                          options={this.getLocationOptions()}
                          onChange={this.setFilter('location')}
                          customStyles={customSelectStyles1}
                        />
                      </FilterOption>
                      <FilterOption>
                        <Label>Status</Label>
                        <InlineSelect
                          value={selectedStatus}
                          options={[{value: '', label: 'All'}].concat(statusList)}
                          onChange={this.setFilter('status')}
                          customStyles={customSelectStyles1}
                        />
                      </FilterOption>
                    </Filter>
                  )}
                  <PageContent>{inventoryItems ? this.renderItems() : this.renderNoItems()}</PageContent>
                  <ScanToModal
                    closeModal={() => this.setState({showScan: false})}
                    modalIsOpen={showScan}
                    spaces={spaces}
                    count={this.getSelecetedCount()}
                    selectedInventoryItems={this.getSelectedItems()}
                    changeLocation={this.changeLocation}
                  />
                  <ReportModal
                    closeModal={() => this.setState({showReportModal: false})}
                    modalIsOpen={showReportModal}
                    link={linkReport}
                  />
                  <CopyToClipboard text={linkReport}>
                    <input type="hidden" ref={this.clipboardRef} />
                  </CopyToClipboard>
                </ItemsContainer>
              </ScrollableContainer>
            </div>
          </div>
        )}
      </UserContext.Consumer>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  locations: state.user.locations
});

export default compose<React.ComponentClass<{}>>(
  connect(mapStateToProps),
  withRouter
)(InventoryItemsPage);

export const InternalInventoryItemsPage = InventoryItemsPage;
