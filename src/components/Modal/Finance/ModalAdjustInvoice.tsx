import * as React from 'react';
import {IModal} from 'src/models/IModal';
import Modal from '../Modal';
import ModalWindow from '../ModalWindow';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import {InjectedFormProps, Field, reduxForm} from 'redux-form';
import Input from 'src/components/Form/Input';
import TextArea from 'src/components/Form/TextArea';
import Notify, {NotifyType} from 'src/utility/Notify';

interface IProps {
  onSubmit: (data: IFormValues) => Promise<any>;
  id: number | undefined;
}

interface IState {
  loading: boolean;
}
export interface IFormValues {
  name: string;
  address: string;
  id?: any;
}

type IParams = IModal & IProps;
class ModalAdjustInvoice extends React.PureComponent<InjectedFormProps<IFormValues, IParams> & IParams, IState> {
  public componentDidMount() {
    this._ISLOADED = true;
  }
  public componentWillUnmount() {
    this._ISLOADED = false;
  }

  public state = {
    loading: false
  };
  public _ISLOADED = false;
  private onSubmit = async (data: IFormValues) => {
    const {id} = this.props;
    data.id = id;

    const {onClose, onSubmit} = this.props;
    this.setState({loading: true});
    try {
      await onSubmit(data);
      Notify(NotifyType.Success, 'A request to Adjust has been sent.');
      onClose();
    } catch (er) {
      Notify(NotifyType.Danger, 'Server error');
    } finally {
      if (this._ISLOADED) {
        this.setState({loading: false});
      }
    }
  };

  private renderBody = () => {
    const {handleSubmit} = this.props;
    return (
      <form autoComplete="off" onSubmit={handleSubmit(this.onSubmit)} id="AdjustModalForm">
        <div className="row">
          <div className="col-8">
            <Field name="name" label="Name" placeholder="Name" component={Input} />
          </div>
        </div>
        <div className="row">
          <div className="col-8">
            <Field name="address" label="Address" component={TextArea} />
          </div>
        </div>
        <div className="row">
          <div className="col-8">
            <a href="/">Replace with contact details</a>
          </div>
        </div>
      </form>
    );
  };

  private renderFooter() {
    return (
      <PrimaryButton className="btn btn-primary" type="submit" form="AdjustModalForm">
        Save
      </PrimaryButton>
    );
  }

  public render() {
    const {isOpen, onClose, title} = this.props;
    const {loading} = this.state;

    return (
      <Modal isOpen={isOpen}>
        <ModalWindow
          onClose={onClose}
          footer={this.renderFooter()}
          body={this.renderBody()}
          loading={loading}
          title={title}
        />
      </Modal>
    );
  }
}

export default reduxForm<IFormValues, IParams>({
  form: 'AdjustModalForm',
  enableReinitialize: true
})(ModalAdjustInvoice);
