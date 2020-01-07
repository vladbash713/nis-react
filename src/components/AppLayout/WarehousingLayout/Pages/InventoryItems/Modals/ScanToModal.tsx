import * as React from 'react';
import Modal from 'src/components/Modal/Modal';
import ModalWindow from 'src/components/Modal/ModalWindow';
import InlineInput from 'src/components/Form/InlineInput';
import {IAppState} from 'src/redux';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {ISelectionReducerConfig} from 'src/redux/reduxWrap';
import styled from 'styled-components';
import {PseudoTable} from 'src/components/Tables/PlainTable';
import {TBody, Tr, Td} from 'src/components/Tables/PseudoTableItems';
import InventoriesService from 'src/services/InventoriesService';
import Icon, {IconName} from 'src/components/Icon/Icon';

const TableWrapper = styled.div`
  margin-top: 10px;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  input {
    max-width: 590px;
    margin-right: 10px;
  }
`;

const Result = styled.div`
  display: flex;
  margin-top: 32px;
  font-size: 15px;
`;

const Highlight = styled.div`
  font-weight: bold;
`;
export interface IScanToModalProps {
  closeModal: (modalType: string) => void;
  modalIsOpen: boolean;
  selectedItems: ISelectionReducerConfig;
  spaces: any[];
  selectedInventoryItems: any[];
  count: number;
  changeLocation: (location: string) => void;
}

export interface IScanToModalState {
  visibleSpaces: any[];
  loading: boolean;
  searchValue: string;
  successSpace: any;
}

class ScanToModal extends React.Component<IScanToModalProps, IScanToModalState> {
  public state = {
    visibleSpaces: [],
    loading: false,
    searchValue: '',
    successSpace: null
  };

  componentWillReceiveProps(next: any) {
    if (!next.modalIsOpen) {
      this.setState({visibleSpaces: [], searchValue: '', successSpace: null});
    }
  }

  private findSpace = (e: any) => {
    const value = e.target.value;
    this.setState({successSpace: null});
    const {spaces} = this.props;
    let visibleSpaces = spaces.filter(space => space.identifier.indexOf(value) !== -1);
    if (!value) {
      visibleSpaces = [];
    }
    this.setState({visibleSpaces, searchValue: value});
  };

  private assign = (space: any) => () => {
    const requestList: Array<Promise<any>> = [];
    this.props.selectedInventoryItems.forEach((item: any) => {
      requestList.push(
        InventoriesService.stopPlacement(item.id).then(() => {
          InventoriesService.startPlacement({
            inventory_item_id: item.id,
            inventory_storage_container_id: item.placement.container.id,
            inventory_storage_space_id: space.id,
            is_used_on_ar: true
          });
        })
      );
    });
    this.setState({loading: true});
    Promise.all(requestList).then(() => {
      this.setState({loading: false, visibleSpaces: [], successSpace: space});
      this.props.changeLocation(space);
    });
  };

  private renderBody = () => {
    const {successSpace, visibleSpaces} = this.state;
    let code = successSpace ? (successSpace as any).location.code : '';
    let name = successSpace ? (successSpace as any).name : '';
    return (
      <div>
        <p>Scan the barcode of location to assign all selected items to the location.</p>
        <InputContainer>
          <InlineInput
            className="form-control"
            type="text"
            placeholder="Scan or type barcode..."
            onChange={this.findSpace}
            value={this.state.searchValue}
          />
          {successSpace && <Icon name={IconName.CheckIcon} size={18} />}
        </InputContainer>

        {!successSpace && visibleSpaces.length > 0 && (
          <TableWrapper>
            <PseudoTable>
              <TBody>
                {this.state.visibleSpaces.map((space: any) => (
                  <Tr onClick={this.assign(space)}>
                    <Td>{`${space.location.code} ${space.name}`}</Td>
                  </Tr>
                ))}
              </TBody>
            </PseudoTable>
          </TableWrapper>
        )}
        {successSpace && (
          <Result>
            <Highlight>{`${this.props.count} items`}</Highlight>
            <div>&nbsp;were scanned to&nbsp;</div>
            <Highlight>{`${code} ${name}`}</Highlight>
          </Result>
        )}
      </div>
    );
  };

  private renderFooter = () => {
    return undefined;
  };

  public render() {
    const {closeModal, modalIsOpen} = this.props;
    const {loading} = this.state;
    return (
      <Modal isOpen={modalIsOpen}>
        <ModalWindow
          onClose={() => closeModal('newInventoryModal')}
          footer={this.renderFooter()}
          body={this.renderBody()}
          loading={loading}
          title="Scan To Location"
        />
      </Modal>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  selectedItems: state.warehousing.selectedPlacements
});

export default compose(connect(mapStateToProps))(ScanToModal);
