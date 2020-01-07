import React from 'react';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {IAppState} from 'src/redux';
import ReactTooltip from 'react-tooltip';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import PageContent from 'src/components/Layout/PageContent';
import UserContext from 'src/components/AppLayout/UserContext';
import ScrollableContainer from 'src/components/Layout/ScrollableContainer';
import InventoriesService from 'src/services/InventoriesService';
import * as _ from 'lodash';
import {ILocation} from 'src/models/IAddress';
import PhotosList from './Photos';

const SubHeader = styled.div`
  padding: 14px 28px 14px 20px;
  border-bottom: 1px solid #d3dbde;
`;

const Title = styled.div`
  font-size: 18px;
  color: #1d1d1d;
`;

const HeaderSub = styled.div`
  display: flex;
  align-items: center;
`;

const Btn = styled.button`
  padding: 8px 12px;
  color: #3498db;
  font-weight: lighter;
  border-color: #3498db;
  box-shadow: 0 0 0 !important;
  cursor: pointer;
  border-radius: 5px;
  font-size: 13px;
  margin: 0 10px;
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

const ItemsContainer = styled.div`
  width: 60%;
`;

const CountItem = styled.div`
  border: 1px solid #d3dbde;
  padding: 10px;
`;

const ItemContainer = styled.div`
  margin: 20px 0;
`;

const ItemHeader = styled.div`
  border: 1px solid #d3dbde;
  padding: 10px;
  background-color: #f9fafa;
  display: flex;
  justify-content: space-between;
  .status1 {
    background-color: #23b376;
    border-radius: 3px;
    padding: 3px;
    color: white;
  }

  .status2 {
    background-color: #909698;
    border-radius: 3px;
    padding: 3px;
    color: white;
  }
`;

const ItemBody = styled.div`
  font-size: 14px;
  padding: 10px;
  border: 1px solid #d3dbde;
`;

const Cost = styled.div`
  font-size: 14px;
`;

interface IConnectProps {
  dispatch: (params?: any) => Promise<any> | void;
  locations: ILocation[];
}

interface IParams {
  id?: string;
}

interface IState {
  loading: boolean;
  report: any;
}

type IProps = RouteComponentProps<IParams>;

class InventoryReportPage extends React.PureComponent<IProps & IConnectProps, IState> {
  public state = {
    loading: true,
    report: null
  };

  public componentDidMount() {
    this.makeVisiableData();
  }

  private makeVisiableData = () => {
    const code = this.props.match.params.id;

    this.getData(code).then(res => {
      this.setState({
        loading: false,
        report: res[0].data
      });
    });
  };

  private getData = (code: any) => {
    const requestList: Array<Promise<any>> = [InventoriesService.getInventoryReport(code)];
    return Promise.all(requestList);
  };

  private renderItems() {
    let arrR: any = [];
    let arrN: any = [];
    let report = this.state.report;
    let items = report ? (report as any).items : [];
    items.forEach((item: any) => {
      let statuses = item.statuses;
      if (statuses.length > 0) {
        let status = statuses[statuses.length - 1];
        if (status.status === 'Restorable') {
          arrR.push(
            <ItemContainer>
              <ItemHeader>
                <div>{item.name}</div>
                <div className="status1">RESTORABLE</div>
              </ItemHeader>
              <ItemBody>
                <Cost>{`Estimated Restorable Cost: ${item.restoration_cost}`}</Cost>
                <Cost>{`Estimated Replacement Cost: ${item.estimated_replacement_cost}`}</Cost>
                {item.photos.length > 0 && (
                  <PhotosList
                    photos={{data: item.photos, selectedPhotos: []}}
                    setSelectedPhotos={() => {}}
                    itemId={item.id}
                    loadPhotos={() => {}}
                    itemName={item.name}
                    onlyView
                  />
                )}
              </ItemBody>
            </ItemContainer>
          );
        } else {
          arrN.push(
            <ItemContainer>
              <ItemHeader>
                <div>{item.name}</div>
                <div className="status2">NON-RESTORABLE</div>
              </ItemHeader>
              <ItemBody>
                <Cost>{`Estimated Restorable Cost: ${item.restoration_cost}`}</Cost>
                <Cost>{`Estimated Replacement Cost: ${item.estimated_replacement_cost}`}</Cost>
                {item.photos.length > 0 && (
                  <PhotosList
                    photos={{data: item.photos, selectedPhotos: []}}
                    setSelectedPhotos={() => {}}
                    itemId={item.id}
                    loadPhotos={() => {}}
                    itemName={item.name}
                    onlyView
                  />
                )}
              </ItemBody>
            </ItemContainer>
          );
        }
      }
    });
    return arrR.concat(arrN);
  }

  public render() {
    const {loading, report} = this.state;

    let inventoryAddress = report ? (report as any).address : '';
    let inventoryJobNumber = report ? (report as any).job_number : '';

    let restorable_items_count = report ? (report as any).restorable_items_count : 0;
    let non_restorable_items_count = report ? (report as any).non_restorable_items_count : 0;

    return (
      <UserContext.Consumer>
        {context => (
          <div className="d-flex h-100 flex-column align-items-stretch">
            <ReactTooltip className="overlapping" effect="solid" place="right" />
            <SubHeader className="d-flex flex-row justify-content-between">
              <HeaderSub>
                <Title>{`Steamatic`}</Title>
                {!loading && <Info>{`${inventoryAddress || 'Unknown'} | ${inventoryJobNumber}`}</Info>}
              </HeaderSub>
              <HeaderSub>
                <Btn>Print</Btn>
              </HeaderSub>
            </SubHeader>
            <div className="h-100">
              <ScrollableContainer className="h-100" style={{paddingBottom: '20px'}}>
                <ItemsContainer className="flex-grow-1 position-relative mx-auto">
                  {loading && <BlockLoading size={40} color={ColorPalette.white} />}
                  <SubTitle>Inventory Report</SubTitle>
                  <PageContent>
                    <CountItem>{`${restorable_items_count} Restorable Items`}</CountItem>
                    <CountItem>{`${non_restorable_items_count} Non-Restorable Items`}</CountItem>
                    {this.renderItems()}
                  </PageContent>
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
)(InventoryReportPage);

export const InternalInventoryItemsPage = InventoryReportPage;
