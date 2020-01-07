import * as React from 'react';
import Modal from 'src/components/Modal/Modal';
import ModalWindow from 'src/components/Modal/ModalWindow';
import SearchInput from 'src/components/SearchInput/SearchInput';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import {IWarehousingJobsNewInventoryState, getJobsNewInventory, setOptions} from 'src/redux/warehousingDucks';
import {IAppState} from 'src/redux';
import {compose, Action} from 'redux';
import {connect} from 'react-redux';
import {ThunkDispatch} from 'redux-thunk';
import {TBody, Td} from 'src/components/Tables/PseudoTableItems';
import {HighlightedTr} from 'src/components/AppLayout/WarehousingLayout/Accessories/AdditionalTableElements';
import {PseudoTable} from 'src/components/Tables/PlainTable';
import {IJob} from 'src/models/IJob';

const BlueButton = styled.div`
  background: ${ColorPalette.blue1};
  border: 2px solid ${ColorPalette.blue1};
  border-radius: 0.25rem;
  cursor: pointer;
  height: 33px;
  color: ${ColorPalette.white};
  line-height: 30px;
  padding-left: 20px;
  padding-right: 20px;
  margin-left: -40px;

  :hover {
    background: ${ColorPalette.white};
    color: ${ColorPalette.blue1};
  }
`;

const TableWrapper = styled.div`
  margin-top: 10px;
`;

const GrayBadge = styled.span`
  background: ${ColorPalette.gray6};
  color: ${ColorPalette.white};
  height: 20px;
  padding: 0 5px;
  line-height: 20px;
  font-weight: 400;
  text-transform: uppercase;
  box-shadow: unset;
  margin-left: 8px;
  border-radius: 3px;
`;

export interface INewInventoryModalProps {
  closeModal: (modalType: string) => void;
  modalIsOpen: boolean;
  jobsNewInventory: IWarehousingJobsNewInventoryState;
  dispatch: ThunkDispatch<any, any, Action>;
  locationId: number | null;
}

export interface INewInventoryModalState {
  searchLoading: boolean;
  selectedRow: number | null;
  searchString: string | null;
}

class NewInventoryModal extends React.Component<INewInventoryModalProps, INewInventoryModalState> {
  public state = {
    searchLoading: false,
    timeout: 0,
    selectedRow: null,
    searchString: null
  };

  public componentDidUpdate(prevProps: INewInventoryModalProps, prevState: INewInventoryModalState) {
    const {locationId} = this.props;
    if (locationId !== null && locationId !== prevProps.locationId) {
      this.getJobs(locationId);
    }
  }

  componentWillReceiveProps(next: any) {
    if (!next.modalIsOpen) {
      this.setState({searchString: ''});
    }
  }

  private setSelectedJob = (jobId: number | null) => {
    const {dispatch} = this.props;
    dispatch(setOptions({selectedInventoryJob: jobId}));
  };

  private getJobs = (locationId: number | null, searchString?: string | null, page?: number) => {
    const {dispatch} = this.props;

    if (locationId) {
      dispatch(getJobsNewInventory(locationId, searchString, page)).then(() => {
        this.setState({searchLoading: false});
      });
    }
  };

  public onSearch = (searchString: string | null) => {
    this.setState({searchString});
    if (this.state.timeout !== null) {
      clearTimeout(this.state.timeout);
    }
    this.state.timeout = window.setTimeout(() => {
      this.setState({searchLoading: true});
      if (this.props.locationId) {
        this.getJobs(this.props.locationId, searchString);
      }
    }, 300);
  };

  private onRowClick = (key: number) => {
    if (this.state.selectedRow === key) {
      this.setState({selectedRow: null});
      this.setSelectedJob(null);
    } else {
      this.setState({selectedRow: key});
      this.setSelectedJob(key);
    }
  };

  private renderBody = () => {
    const {jobsNewInventory} = this.props;
    if (!jobsNewInventory.data) {
      return undefined;
    }
    const jobs = jobsNewInventory.data!.data.filter(job => job.site_address !== null);

    return (
      <div>
        <SearchInput
          loading={!!this.state.searchLoading}
          onSearchValueChange={this.onSearch}
          placeholder={'Type to start searching...'}
          searchIcon={true}
        />
        {this.state.searchString && (
          <TableWrapper>
            <PseudoTable>
              <TBody>
                {jobs.slice(0, 6).map((job: IJob) => (
                  <HighlightedTr selected={job.id === this.state.selectedRow} onClick={() => this.onRowClick(job.id)}>
                    <Td>
                      {job.site_address!.full_address}
                      {job.has_inventory ? <GrayBadge>Existing</GrayBadge> : null}
                    </Td>
                    <Td>{job.job_number}</Td>
                  </HighlightedTr>
                ))}
              </TBody>
            </PseudoTable>
          </TableWrapper>
        )}
      </div>
    );
  };

  private renderFooter = () => {
    return <BlueButton onClick={() => this.props.closeModal('newInventoryModal')}>OK</BlueButton>;
  };

  public render() {
    const {closeModal, modalIsOpen} = this.props;

    return (
      <Modal isOpen={modalIsOpen}>
        <ModalWindow
          onClose={() => closeModal('newInventoryModal')}
          footer={this.renderFooter()}
          body={this.renderBody()}
          loading={false}
          title="New Inventory"
        />
      </Modal>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  jobsNewInventory: state.warehousing.jobsNewInventory
});

export default compose(connect(mapStateToProps))(NewInventoryModal);
