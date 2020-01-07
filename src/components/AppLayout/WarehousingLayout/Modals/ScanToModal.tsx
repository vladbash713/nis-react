import * as React from 'react';
import Modal from 'src/components/Modal/Modal';
import ModalWindow from 'src/components/Modal/ModalWindow';
import InlineInput from 'src/components/Form/InlineInput';
import {IAppState} from 'src/redux';
import {compose, Action} from 'redux';
import {connect} from 'react-redux';
import {IWarehousingStorageSpacesState} from 'src/redux/warehousingDucks';
import {ThunkDispatch} from 'redux-thunk';
import {getStorageSpaces} from 'src/redux/warehousingDucks';
// import WarehousingService from 'src/services/WarehousingService';
import {ISpace} from 'src/models/IStorage';
import {ISelectionReducerConfig} from 'src/redux/reduxWrap';

export interface IScanToModalProps {
  closeModal: (modalType: string) => void;
  dispatch: ThunkDispatch<any, any, Action>;
  modalIsOpen: boolean;
  selectedItems: ISelectionReducerConfig;
  storageSpaces: IWarehousingStorageSpacesState;
}

export interface IScanToModalState {
  searchLoading: boolean;
  selectedSpace: ISpace | null;
}

class ScanToModal extends React.Component<IScanToModalProps, IScanToModalState> {
  public state = {
    timeout: 0,
    searchLoading: false,
    selectedSpace: null
  };

  private renderBody = () => {
    return (
      <div>
        <p>Scan the barcode of location to assign all selected items to the location.</p>
        <InlineInput
          onChange={this.handleTextSearch}
          className="form-control"
          type="text"
          placeholder="Scan or type barcode..."
        />
      </div>
    );
  };

  private getSpaces = () => {
    this.props.dispatch(getStorageSpaces()).then(() => {
      this.setState({searchLoading: false});
    });
  };

  private handleTextSearch = (event: any) => {
    if (this.state.timeout !== null) {
      clearTimeout(this.state.timeout);
    }
    this.state.timeout = window.setTimeout(() => {
      this.setState({searchLoading: true});

      this.getSpaces();
    }, 300);
  };

  // private scanTo = () => {
  //   const {selectedItems} = this.props;
  //   const {selectedSpace} = this.state;
  //   if (selectedSpace) {
  //     WarehousingService.scanToLocation(selectedSpace.id, selectedItems);
  //   }
  // }

  private renderFooter = () => {
    return undefined;
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
          title="Scan To Location"
        />
      </Modal>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  selectedItems: state.warehousing.selectedPlacements,
  storageSpaces: state.warehousing.storageSpaces
});

export default compose(connect(mapStateToProps))(ScanToModal);
