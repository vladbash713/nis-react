import * as React from 'react';
import Modal from 'src/components/Modal/Modal';
import ModalWindow from 'src/components/Modal/ModalWindow';
import {compose} from 'redux';
import InlineInput from 'src/components/Form/InlineInput';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';

const Button = styled.button`
  border: 1px solid ${ColorPalette.gray2};
  border-radius: 4px;
  margin-left: 20px;
  cursor: pointer;
`;

const Container = styled.div`
  display: flex;
`;

export interface IScanToModalProps {
  closeModal: (modalType: string) => void;
  modalIsOpen: boolean;
  link: string;
}

export interface IScanToModalState {}

class ReportModal extends React.Component<IScanToModalProps, IScanToModalState> {
  private renderBody = () => {
    return (
      <div>
        <p>
          Your link has been copied to the clipboard. Use this link to send the report to customers or insurers and
          allow them to approve the costings. This link will allow them to see each inventory item, the restoration
          status and related photos.
        </p>
        <Container>
          <InlineInput className="form-control" type="text" disabled value={this.props.link} />
          <CopyToClipboard text={this.props.link}>
            <Button>Copy</Button>
          </CopyToClipboard>
        </Container>
      </div>
    );
  };

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
          title="Get Link"
        />
      </Modal>
    );
  }
}

export default compose()(ReportModal);
