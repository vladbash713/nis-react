import React from 'react';
import {compose} from 'redux';
import ReactTooltip from 'react-tooltip';
import {matchPath, RouteComponentProps, withRouter} from 'react-router-dom';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import {IconName} from 'src/components/Icon/Icon';
import FullSidebarMenuItem, {IMenuItem} from 'src/components/SidebarMenu/FullSidebarMenuItem';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import UserContext from 'src/components/AppLayout/UserContext';
import ScrollableContainer from 'src/components/Layout/ScrollableContainer';
import FullSidebarMenu from 'src/components/SidebarMenu/FullSidebarMenu';
import {ColoredDiv} from 'src/components/Layout/Common/StyledComponents';
import DropdownMenuControl from 'src/components/Layout/MenuItems/DropdownMenuControl';
import ColoredIcon from 'src/components/Icon/ColoredIcon';
// import CheckboxSimple from 'src/components/Form/CheckboxSimple';
import {IInventoryItemInfo} from 'src/models/IInventories';
import InventoriesService from 'src/services/InventoriesService';
import {IInventory} from 'src/models/IInventories';
import InlineSelect from 'src/components/Form/InlineSelect';
import moment from 'moment';
import UserService from 'src/services/UserService';
import NoteComponentWrapper from 'src/components/TextEditor/NoteComponentWrapper';
import NoteComponent from 'src/components/TextEditor/NoteComponent';
import {INote} from 'src/models/INotesAndMessages';
import ReactHtmlParser from 'react-html-parser';
import {openModal} from 'src/redux/modalDucks';
import {connect} from 'react-redux';
import ScanToModal from './Modals/ScanToModal';
import {sanitize, replaceMentions} from 'src/utility/Helpers';

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

const SubHeader = styled.div`
  padding: 9px 25px 9px 26px;
  border-bottom: 1px solid #d3dbde;
`;

const Title = styled.div`
  font-weight: 700;
  font-size: 1.15rem;
  color: #1d1d1d;
`;

// const Tasks = styled.div`
//   margin: 0 40px;
// `;

const Info = styled.div`
  font-size: 16px;
  color: #909698;
  margin-left: 31px;
`;

// const TasksHeader = styled.div`
//   display: flex;
//   justify-content: space-between;
// `;

const HeaderSub = styled.div`
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 1.15rem;
  color: #959595;
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
`;

const Label = styled.div`
  font-size: 20px;
  color: #1d1d1d;
  margin-bottom: 30px;
  &.tasks {
    margin: 0;
  }
  &.tasks-body {
    font-size: 14px;
    margin-bottom: 10px;
  }
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
  margin-bottom: 30px;
  &.half {
    width: 22%;
  }
`;

const Options = styled(DropdownMenuControl)`
  background-color: #3498db;
  padding: 3px 12px 8px 12px;
  border-radius: 0.25rem;
  font-size: 1rem;
  font-weight: lighter;
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

// const CheckboxContainer = styled.div`
//   display: flex;
//   > label {
//     margin-right: 5px;
//     margin-top: 3px;
//   }
// `;

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

// const TasksBody = styled.div`
//   border: 1px solid #d3dbde;
//   padding: 15px;
//   border-radius: 4px;
//   margin-top: 20px;
// `;

const History = styled.div`
  margin: 30px 0px;
  border-top: 1px solid #d3dbde;
`;

const HistoryStatus = styled.div`
  display: flex;
  justify-content: space-between;
  border-left: 4px solid #959595;
  font-size: 14px;
  border-top: 1px solid #d3dbde;
  border-bottom: 1px solid #d3dbde;
  background: #fafafa;
  color: #5d5d5d;
  padding-top: 14px;
  padding-bottom: 14px;
  padding-left: 88px;
  margin-top: -1px;
  span {
    font-weight: bold;
  }
  .date {
    font-size: 12px;
    margin-right: 21px;
    width: 140px;
  }
`;

const HistoryNote = styled.div`
  color: #5d5d5d;
  padding: 21px 0;
  border-bottom: 1px solid #d3dbde;
  border-left: 4px solid #f5aa00;

  .avatar {
    width: 40px;
    height: 40px;
    line-height: 40px;
    margin-left: 24px;
    border-radius: 4px;
    overflow: hidden;
    background-color: #71ba90;
    background-size: cover;
    text-align: center;
    font-size: 130%;
    font-weight: 700;
    color: white;
  }

  .title3 {
    margin-left: 24px;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    font-size: 1.1rem;
    font-weight: 500;
    .title {
      font-weight: 700;
    }
    .action {
      padding-left: 10px;
      color: #f5aa00;
    }
  }

  .date {
    width: 140px;
    font-size: 0.85rem;
    margin-right: 21px;
  }

  .cus1 {
    margin-left: 88px;
  }
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

const hourOptions = [
  {value: '30 mins', label: '30 mins'},
  {value: '1 hour', label: '1 hour'},
  {value: '2 hours', label: '2 hours'},
  {value: '3 hours', label: '3 hours'},
  {value: '4 hours', label: '4 hours'},
  {value: '5 hours', label: '5 hours'},
  {value: '5-10 hours', label: '5-10 hours'},
  {value: '10-20 hours', label: '10-20 hours'},
  {value: '1 day', label: '1 day'},
  {value: '2+ days', label: '2+ days'}
];

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
  standardTypes: any;
  history: any;
  showNoteForm: boolean;
  users: any;
  showScan: boolean;
  spaces: any[];
}

type IProps = RouteComponentProps<IParams>;

class InventoryItemNotesPage extends React.PureComponent<IProps & IConnectProps, IState> {
  public state = {
    loading: true,
    data: {},
    inventory: {},
    standardTypes: [],
    history: [],
    showNoteForm: false,
    users: [],
    showScan: false,
    spaces: []
  };

  componentDidMount() {
    const inventoryItemId = Number(this.props.match.params.id);
    InventoriesService.getInventoryItem(inventoryItemId).then(res => {
      InventoriesService.getInventoryInfo(res.data.inventory_id).then(info => {
        Promise.all([
          InventoriesService.getItemStandardTypes(),
          UserService.getUserList(),
          InventoriesService.getSpaces()
        ]).then(pres => {
          const {statuses, notes} = res.data;
          let history: any[] = [];
          const users = pres[1].data;
          statuses.forEach((status: any) => {
            let userName: string | null = '';
            users.forEach(user => {
              if (user.id === status.user_id) {
                userName = user.full_name;
              }
            });
            history.push({
              date: moment(status.created_at).format('DD MMMM YYYY, hh:mm A'),
              created_at: status.created_at,
              type: 'status',
              value: status.status,
              userName
            });
          });
          notes.forEach((note: any) => {
            let userName: string | null = '';
            users.forEach(user => {
              if (user.id === note.user_id) {
                userName = user.full_name;
              }
            });
            history.push({
              date: moment(note.created_at).format('DD MMMM YYYY, hh:mm A'),
              created_at: note.created_at,
              type: 'note',
              value: note.note_resolved,
              userName
            });
          });
          history.sort((a, b) => moment(b.created_at || '').diff(a.created_at || ''));
          this.setState({
            data: res.data,
            inventory: info.data,
            standardTypes: pres[0].data,
            history,
            users: pres[1].data,
            loading: false,
            spaces: pres[2].data
          });
        });
      });
    });
  }

  private showScanModal = () => {
    this.setState({showScan: true});
  };

  private parseNote = (note: string) => replaceMentions(sanitize(note));

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

  // private renderTrigger = () => {
  //   return (
  //     <SortTrigger className="d-flex align-items-center" margin="5px 0 0 0">
  //       <ColoredDiv color={ColorPalette.white} margin="0 5px 0 0">
  //         Add To-Do
  //       </ColoredDiv>
  //       <ColoredIcon name={IconName.ArrowDown} color={ColorPalette.white} size={16} />
  //     </SortTrigger>
  //   );
  // };

  private getStandardOptions() {
    const items = this.state.standardTypes;
    let options: any[] = [];
    items.forEach((item: any) => {
      options.push({
        value: item.id,
        label: item.name
      });
    });
    return options;
  }

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

  private getItems1 = (): any[] => {
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
      // {
      //   name: 'Manually select location',
      //   onClick: () => {}
      // },
      {
        name: 'Add note',
        onClick: () => this.setState({showNoteForm: true})
      },
      {
        type: 'divider'
      },
      // {
      //   name: 'Upload a photo',
      //   onClick: () => {}
      // },
      {
        name: 'Print',
        onClick: () => {}
      },
      {
        type: 'divider'
      }
    ];

    return arr1.concat(arr);
  };

  // private getItems = (): any[] => {
  //   let arr: any[] = [];

  //   arr = arr.concat([
  //     {
  //       name: 'Delete',
  //       onClick: () => {}
  //     }
  //   ]);

  //   return arr;
  // };

  private renderTrigger1 = () => {
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
      if (field === 'standard') {
        const items = this.state.standardTypes;
        items.forEach((item: any) => {
          if (item.id === e.value) {
            newData.standard_type = item;
            newData.assessment_fee = item.assessment_fee;
            newData.estimated_replacement_cost = item.estimated_replacement_cost;
            newData.restoration_hours = item.restoration_hours;
            newData.restoration_cost = item.restoration_cost;
          }
        });
      } else if (field === 'hour') {
        newData.restoration_hours = e.value;
      } else {
        if (e.target.value === '$') {
          return;
        }
        newData[field] = e.target.value.replace(/\$/g, '').replace(/ /g, '');
        if (
          isNaN(Number(newData[field].charAt(newData[field].length - 1))) &&
          newData[field].charAt(newData[field].length - 1) !== '.'
        ) {
          return;
        }
        if (newData[field].indexOf('.') !== -1 && newData[field].split('.')[1].length > 2) {
          return;
        }
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
      const standard_type = newData ? (newData as IInventoryItemInfo).standard_type : {};
      const assessment_fee = newData ? (newData as IInventoryItemInfo).assessment_fee : '';
      const estimated_replacement_cost = newData ? (newData as IInventoryItemInfo).estimated_replacement_cost : '';
      const restoration_hours = newData ? (newData as IInventoryItemInfo).restoration_hours : '';
      const restoration_cost = newData ? (newData as IInventoryItemInfo).restoration_cost : '';
      const inventory_item_standard_type_id = standard_type ? standard_type.id : '';

      let payload = {
        inventory_id: inventory_id || '',
        job_id: job_id || '',
        identifier: identifier || '',
        name: name || '',
        quantity: quantity || '',
        condition: condition || '',
        serial_number: serial_number || '',
        model: model || '',
        customer_location: customer_location || '',
        assessment_fee: Number(assessment_fee) || 0,
        estimated_replacement_cost: Number(estimated_replacement_cost) || 0,
        restoration_cost: Number(restoration_cost) || 0,
        restoration_hours: restoration_hours || '',
        inventory_item_standard_type_id: inventory_item_standard_type_id || ''
      };

      InventoriesService.updateInventoryItem(id, payload);
    }
  };

  private renderHistory() {
    const {history} = this.state;
    let obj: any[] = [];
    history.forEach((his: any) => {
      if (his.type === 'status') {
        obj.push(
          <HistoryStatus>
            <div>
              Status changed to <span>{his.value}</span> by {his.userName}
            </div>
            <div className="date">{his.date}</div>
          </HistoryStatus>
        );
      }
      if (his.type === 'note') {
        obj.push(
          <HistoryNote className="d-flex flex-row align-items-end">
            <div className="flex-grow-1">
              <div className="d-flex">
                <div className="flex-shrink-0 avatar">RE</div>
                <div className="flex-grow-1 title3">
                  <span className="title">{his.userName}</span>
                  <div className="action">added a note</div>
                </div>
                <div className="date">{his.date}</div>
              </div>
              <div className="flex-column cus1">
                <div className="">
                  {his.value && <div>{ReactHtmlParser(this.parseNote(his.value))}</div>}
                  <br />
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 align-self-start" />
          </HistoryNote>
        );
      }
    });
    return obj;
  }

  private saveNoteDraft = async (note: INote) => {
    const inventoryItemId = Number(this.props.match.params.id);
    InventoriesService.addNoteToInventoryItem(note.id, inventoryItemId).then(res => {
      let history: any[] = this.state.history;
      const users = this.state.users;
      const note = res.data.note;
      let userName: string | null = '';
      users.forEach((user: any) => {
        if (user.id === note.user_id) {
          userName = user.full_name;
        }
      });
      history.unshift({
        date: moment(note.created_at).format('DD MMMM YYYY, hh:mm A'),
        created_at: note.created_at,
        type: 'note',
        value: note.note,
        userName
      });
      this.setState({history, showNoteForm: false});
    });
  };

  private cancelNote = () => {
    this.setState({
      showNoteForm: false
    });
  };

  private changeLocation = (space: any) => {
    const inventoryItem: any = this.state.data;
    let newData = Object.assign({}, inventoryItem);
    newData.placement.space = space;
    this.setState({data: newData});
  };

  public render() {
    const {loading, data, inventory, showNoteForm, showScan, spaces} = this.state;
    const standard_type = data ? (data as IInventoryItemInfo).standard_type : {};
    const assessment_fee = data ? `$ ${(data as IInventoryItemInfo).assessment_fee || ''}` : '';
    const estimated_replacement_cost = data ? `$ ${(data as IInventoryItemInfo).estimated_replacement_cost || ''}` : '';
    const restoration_hours = data ? (data as IInventoryItemInfo).restoration_hours : '';
    const restoration_cost = data ? `$ ${(data as IInventoryItemInfo).restoration_cost || ''}` : '';
    // const restoration_cost = data ? `$ ${Number((data as IInventoryItemInfo).restoration_cost).toFixed(2)}` : '';
    const inventoryItemId = data ? (data as IInventoryItemInfo).id : '';
    const inventoryAddress = inventory ? (inventory as IInventory).address || 'Unknown' : '';
    const inventoryJobNumber = inventory ? (inventory as IInventory).job_number : '';
    const job_id = data ? (data as IInventoryItemInfo).job_id : '';
    const status_obj = data ? (data as IInventoryItemInfo).current_status : null;
    const status = status_obj ? (status_obj as any).status : '';
    const selectedHour = {value: restoration_hours, label: restoration_hours};
    const selectedItem = standard_type ? {value: standard_type.id, label: standard_type.name} : null;

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
                <Options items={this.getItems1()} noMargin={true} direction="right" trigger={this.renderTrigger1} />
              </HeaderSub>
            </SubHeader>
            <div className="d-flex flex-row align-items-stretch" style={{height: 'calc(100% - 52px)'}}>
              <FullSidebarMenu>
                {this.getMenuItems().map((item: IMenuItem) => (
                  <FullSidebarMenuItem key={item.label} item={item} />
                ))}
              </FullSidebarMenu>
              <div className="flex-grow-1 position-relative">
                {loading && <BlockLoading size={40} color={ColorPalette.white} />}
                <ScrollableContainer className="h-100">
                  <Item>
                    <Label>Restorable Assessment</Label>
                    <ItemRow>
                      <InputContainer>
                        <InputLabel>Standard Item</InputLabel>
                        <InlineSelect
                          value={selectedItem}
                          options={this.getStandardOptions()}
                          onChange={this.updateInfo('standard')}
                          customStyles={customSelectStyles1}
                        />
                      </InputContainer>
                      <InputContainer className="half">
                        <InputLabel>Restoration Hour</InputLabel>
                        <InlineSelect
                          value={selectedHour}
                          options={hourOptions}
                          onChange={this.updateInfo('hour')}
                          customStyles={customSelectStyles1}
                        />
                      </InputContainer>
                      <InputContainer className="half">
                        <InputLabel>Restoration Cost</InputLabel>
                        <Input value={restoration_cost} onChange={this.updateInfo('restoration_cost')} />
                      </InputContainer>
                    </ItemRow>
                    <ItemRow>
                      <InputContainer>
                        <InputLabel>Assessment Fee</InputLabel>
                        <Input value={assessment_fee} onChange={this.updateInfo('assessment_fee')} />
                      </InputContainer>
                      <InputContainer>
                        <InputLabel>Estimated Replacement Cost</InputLabel>
                        <Input
                          value={estimated_replacement_cost}
                          onChange={this.updateInfo('estimated_replacement_cost')}
                        />
                      </InputContainer>
                    </ItemRow>
                  </Item>
                  {/* <Tasks>
                    <TasksHeader>
                      <Label className="tasks">Tasks</Label>
                      <Options items={this.getItems()} noMargin={true} direction="right" trigger={this.renderTrigger} />
                    </TasksHeader>
                    <TasksBody>
                      <Label className="tasks-body">QR Check</Label>
                      <CheckboxContainer>
                        <CheckboxSimple value={false} onChange={() => {}} size={15} inversedColors={false} />
                        <Label className="tasks-body">Power check</Label>
                      </CheckboxContainer>
                      <CheckboxContainer>
                        <CheckboxSimple value={false} onChange={() => {}} size={15} inversedColors={false} />
                        <Label className="tasks-body">Function test(s)</Label>
                      </CheckboxContainer>
                      <CheckboxContainer>
                        <CheckboxSimple value={false} onChange={() => {}} size={15} inversedColors={false} />
                        <Label className="tasks-body">Electricial safety + tagged</Label>
                      </CheckboxContainer>
                      <CheckboxContainer>
                        <CheckboxSimple value={false} onChange={() => {}} size={15} inversedColors={false} />
                        <Label className="tasks-body">QR check passed</Label>
                      </CheckboxContainer>
                    </TasksBody>
                  </Tasks> */}
                  <History>
                    {/* {addNote && <AddNote />} */}
                    {showNoteForm && (
                      <NoteComponentWrapper padding="40px 30px" overflow="visible">
                        <NoteComponent
                          afterSave={this.saveNoteDraft}
                          color={ColorPalette.orange0}
                          onCancel={this.cancelNote}
                        />
                      </NoteComponentWrapper>
                    )}
                    {this.renderHistory()}
                  </History>
                  <ScanToModal
                    closeModal={() => this.setState({showScan: false})}
                    modalIsOpen={showScan}
                    spaces={spaces}
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
)(InventoryItemNotesPage);

export const InternalInventoryItemNotesPage = InventoryItemNotesPage;
