import * as React from 'react';
import {ILocation} from 'src/models/IAddress';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import LocationSelect from 'src/components/AppLayout/WarehousingLayout/Partials/LocationSelect';
import {getEntityById} from 'src/services/helpers/ApiHelpers';
// import NewInventoryModal from 'src/components/AppLayout/WarehousingLayout/Modals/NewInventoryModal';
import ScanToModal from './Modals/ScanToModal';
import Typography from 'src/constants/Typography';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import ModalNewInventory from 'src/components/Modal/Operations/Warehouse/NewInventory';
import JobService from 'src/services/JobService';
import InventoriesService from 'src/services/InventoriesService';

export const headerHeight = 55;

const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: ${headerHeight}px;
  flex-shrink: 0;
  background: ${ColorPalette.white};
  color: ${ColorPalette.black0};
  border-bottom: 1px solid ${ColorPalette.gray2};
  height: 52px;
`;

const InnerHeadBlock = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  margin-right: 25px;
`;

const ContentItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0 10px 0 0;
  border-right: 1px solid ${ColorPalette.white};
  height: 100%;
  position: relative;

  :last-child {
    border-right: 0;
  }
`;

const TitleBlock = styled.div`
  font-weight: ${Typography.weight.bold};
  font-size: ${Typography.size.medium};
  color: ${ColorPalette.black0};
  display: flex;
  padding-left: 26px;
  align-items: center;
`;

export interface IWarehousingHeaderProps {
  title: string;
  location: any;
  locations: ILocation[];
  locationId: number | null;
  onLocationChange: (locationId: number) => void;
}

export interface IWarehousingHeaderState {
  showNewModal: boolean;
  activeJobs: any[];
  jobsLoading: boolean;
  locationId: number | null;
}

export default class WarehousingHeader extends React.Component<IWarehousingHeaderProps, IWarehousingHeaderState> {
  public state = {
    newInventoryModal: false,
    scanToModal: false,
    showNewModal: false,
    activeJobs: [],
    jobsLoading: false,
    locationId: null
  };

  public setLocationId = (location: any) => {
    this.setState({
      locationId: location.id
    });
    this.props.onLocationChange(location.id);
  };

  private getLocationNameById = (id?: number | null) => {
    const location = getEntityById(this.props.locations, id ? id : 0) as ILocation;
    return location && location.name;
  };

  private getPageButtons = () => {
    const {location} = this.props;
    const elements = [];

    switch (location.pathname) {
      case '/operations/warehousing/inventories':
        elements.push(
          <PrimaryButton className="btn" onClick={this.showNewModal}>
            New
          </PrimaryButton>
        );
        break;
      // case '/operations/warehousing/items':
      //   elements.push(
      //     <PrimaryButton className="btn" onClick={() => this.openModal('scanToModal')}>
      //       Scan To
      //     </PrimaryButton>
      //   );
      //   break;

      default:
        break;
    }

    return elements.length !== 0 ? <ContentItem>{elements}</ContentItem> : null;
  };

  public openModal = (modalType: string) => {
    // this.setState({[modalType]: true});
  };

  public closeModal = (modalType: string) => {
    // this.setState({[modalType]: false});
  };

  private onInventoryCreate = (job: any) => () => {
    this.setState({jobsLoading: true});
    InventoriesService.createNewInventory(job.id).then(res => {
      this.closeNewModal();
      this.setLocationId({id: job.assigned_location.id});
    });
  };

  private closeNewModal = () => {
    this.setState({showNewModal: false});
  };

  private showNewModal = () => {
    this.setState({showNewModal: true, jobsLoading: true});
    JobService.getAllJobs({}).then((res: any) => {
      this.setState({
        activeJobs: res.data,
        jobsLoading: false
      });
    });
  };

  public render() {
    const {title, locations, locationId} = this.props;
    const locationName = this.getLocationNameById(locationId);
    const {jobsLoading, activeJobs, showNewModal} = this.state;
    return (
      <Head>
        <InnerHeadBlock>
          <ContentItem>
            <TitleBlock>{title}</TitleBlock>
          </ContentItem>
        </InnerHeadBlock>
        <InnerHeadBlock>
          <ContentItem>
            <LocationSelect
              options={locations}
              value={locationId ? {id: locationId, name: locationName} : undefined}
              getOptionValue={(option: ILocation) => option.id.toString()}
              getOptionLabel={(option: ILocation) => option.name}
              placeholder="Select location..."
              onChange={this.setLocationId}
            />
          </ContentItem>

          {this.getPageButtons()}
        </InnerHeadBlock>

        {/* <NewInventoryModal
          closeModal={() => this.closeModal('newInventoryModal')}
          modalIsOpen={this.state.newInventoryModal}
          locationId={locationId}
        /> */}
        {showNewModal && (
          <ModalNewInventory
            locationId={locationId}
            onSave={this.onInventoryCreate}
            isOpen={showNewModal}
            onClose={this.closeNewModal}
            jobsLoading={jobsLoading}
            jobs={activeJobs}
          />
        )}
        <ScanToModal closeModal={() => this.closeModal('scanToModal')} modalIsOpen={this.state.scanToModal} />
      </Head>
    );
  }
}
