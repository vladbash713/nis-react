import {IModal} from 'src/models/IModal';
import * as React from 'react';
import Modal from 'src/components/Modal/Modal';
import ModalWindow from 'src/components/Modal/ModalWindow';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import SearchInput from 'src/components/SearchInput/SearchInput';
import styled from 'styled-components';
import withoutProps from 'src/components/withoutProps/withoutProps';
import ColorPalette from 'src/constants/ColorPalette';
import {ColoredDiv} from 'src/components/Layout/Common/StyledComponents';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';

interface IProps {
  locationId: number | null;
  onSave: (job: any) => any;
  onClose: () => any;
  isOpen: boolean;
  jobsLoading: boolean;
  jobs: any[];
}

interface IState {
  loading: boolean;
  searchedJobs: any[];
  selectedJob: any;
}

const JobsHolder = styled.div`
  margin-top: 30px;
`;

export const JobItem = styled(withoutProps(['selected'])('div'))<{selected?: boolean}>`
  border-width: 1px 1px 0 1px;
  border-style: solid;
  border-color: ${ColorPalette.gray2};
  padding: 0px 10px;
  min-height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${props => (props.selected ? ColorPalette.blue0 : ColorPalette.white)};

  &:last-child {
    border-width: 1px 1px 1px 1px;
  }
`;

class ModalNewInventory extends React.PureComponent<IProps & IModal, IState> {
  public state = {
    loading: false,
    searchedJobs: [],
    selectedJob: null
  };

  public componentDidMount() {}

  private onSearchValueChange = (search: string) => {
    const searchStr = search.toLowerCase();
    const {jobs} = this.props;
    let result: any[] = [];
    if (searchStr === '') {
      this.setState({searchedJobs: result});
      return;
    }
    jobs.forEach(job => {
      let checkInsurer =
        job.insurer && job.insurer.contact_name && job.insurer.contact_name.toLowerCase().indexOf(searchStr) !== -1;
      let checkAddress =
        job.site_address &&
        job.site_address.full_address &&
        job.site_address.full_address.toLowerCase().indexOf(searchStr) !== -1;
      let checkId = job.id.toString().indexOf(searchStr) !== -1;
      if (checkInsurer || checkAddress || checkId) {
        result.push(job);
      }
    });
    this.setState({searchedJobs: result});
  };

  private selectJob = (job: any) => () => {
    this.setState({selectedJob: job});
  };

  private renderJobs = () => {
    const {searchedJobs, selectedJob} = this.state;
    let id = selectedJob ? (selectedJob as any).id : '';
    return (
      <JobsHolder>
        {searchedJobs.map((job: any) => (
          <JobItem selected={job.id === id} onClick={this.selectJob(job)}>
            <div>{`${job.insurer ? job.insurer.contact_name : 'Unknown'}, ${
              job.site_address ? job.site_address.full_address : 'Unknown'
            }`}</div>
            <div className="d-flex align-items-center">
              <ColoredDiv>{`#${job.id}-${job.assigned_location ? job.assigned_location.code : 'Unknown'}`}</ColoredDiv>
            </div>
          </JobItem>
        ))}
      </JobsHolder>
    );
  };

  private renderBody = () => {
    const {locationId, jobsLoading} = this.props;
    const {loading} = this.state;

    return (
      <>
        <div>
          <div className="row">
            <div className="col-12">
              <SearchInput
                loading={loading}
                placeholder="Search..."
                searchIcon={true}
                mode="typeGray"
                disabled={!locationId}
                onSearchValueChange={this.onSearchValueChange}
              />
            </div>
          </div>
          {jobsLoading ? <BlockLoading size={40} color={ColorPalette.white} /> : this.renderJobs()}
        </div>
      </>
    );
  };

  private renderFooter = () => {
    return (
      <PrimaryButton className="btn" disabled={false} onClick={this.props.onSave(this.state.selectedJob)}>
        OK
      </PrimaryButton>
    );
  };

  public render() {
    const {isOpen, onClose} = this.props;

    return (
      <Modal isOpen={isOpen}>
        <ModalWindow
          onClose={onClose}
          title="New Inventory"
          body={this.renderBody()}
          footer={this.renderFooter()}
          loading={this.state.loading}
        />
      </Modal>
    );
  }
}

export default ModalNewInventory;
