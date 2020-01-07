import * as React from 'react';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import {Action, compose} from 'redux';
import {Field, InjectedFormProps, reduxForm, getFormValues} from 'redux-form';
import {ThunkDispatch} from 'redux-thunk';
import Input from 'src/components/Form/Input';
import Select from 'src/components/Form/Select';
import TextEditorField from 'src/components/Form/TextEditorField';
import AttachedFiles from 'src/components/TextEditor/AttachedFiles';
import {email, emails, required, requiredHtml} from 'src/services/ValidationService';
import {IDocument} from 'src/models/IDocument';
import {MessageType} from 'src/models/INotesAndMessages';
import ContactsSearch from 'src/components/Form/ContactSelectors/AssignedContactSelector';
import {connect} from 'react-redux';
import {IAppState} from 'src/redux';
import {IContactAssignment} from 'src/models/IJob';
import {IEditedReplyState, removeDocumentFromReply} from 'src/redux/editedReply';
import LongAlert from 'src/components/LongAlert/LongAlert';
import {IReturnType} from 'src/redux/reduxWrap';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';

interface ISendAsOption {
  value: MessageType;
  label: string;
}

export interface IFormData {
  type: ISendAsOption;
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
}

interface IOwnProps {
  onSave: (data: IFormData) => void;
  onCancel: () => void;
  postDocument: (files?: Blob[] | FileList | null) => void;
  onSubmit: (data: any) => {};
  disabled: boolean;
  documents?: IDocument[] | null;
}

interface IConnectProps {
  contacts: IReturnType<IContactAssignment[]>;
  editedReply: IEditedReplyState;
  formData: IFormData;
  dispatch: ThunkDispatch<any, any, Action>;
}

type IProps = InjectedFormProps<IFormData, IOwnProps> & IOwnProps & IConnectProps;

const StyledLabel = styled.label`
  color: ${ColorPalette.gray4};
`;

const EditorWrapper = styled.div`
  margin-top: 25px;
  border: 1px solid ${ColorPalette.gray2};
`;

const EditorFooter = styled.div`
  text-align: right;
  background: ${ColorPalette.blue0};
  height: 45px;
`;

const SubmitButton = styled.button`
  background: ${ColorPalette.blue1};
  color: ${ColorPalette.white};
  padding: 0 25px;
  border: 0;
  border-radius: 0;
  height: 100%;
  cursor: pointer;
`;

const AttachedFilesWrapper = styled.div`
  margin-top: 5px;
`;

const FooterPlaceholder = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  flex-direction: column;
  padding-left: 10px;
  color: ${ColorPalette.gray5};
  float: left;
  height: 100%;
`;

export const EmailReplyTypes: ISendAsOption[] = [
  {
    value: MessageType.EMAIL,
    label: 'Email'
  },
  {
    value: MessageType.SMS,
    label: 'SMS'
  }
];

export class EmailReplyForm extends React.PureComponent<IProps> {
  private saveDraft = () => {
    this.props.handleSubmit(this.props.onSave)();
  };

  private clickOnHintItem = {
    [MessageType.EMAIL]: (o: IContactAssignment, fieldName: string) => {
      this.props.change(fieldName, o.email);
    },
    [MessageType.SMS]: (o: IContactAssignment, fieldName: string) => {
      this.props.change(fieldName, o.mobile_phone);
    }
  };

  public get assignedContacts() {
    if (!this.props.contacts.data) {
      return [];
    }
    return this.props.contacts.data.map(contact => ({
      ...contact,
      disabled:
        this.props.formData.type && this.props.formData.type.value === MessageType.SMS
          ? !contact.mobile_phone
          : !contact.email
    }));
  }

  private removeDocumentFromReply = async (documentId: number) => {
    return await this.props.dispatch(removeDocumentFromReply(documentId));
  };

  private onMultipleSelectContact = (contact: IContactAssignment, field: string) => {
    const value = ((this.props.formData[field] as string) || '')
      .split(',')
      .map(v => v.trim())
      .filter(v => !!v && v !== contact.email && !email(v));
    value.push(contact.email);
    this.props.change(field, value.join(`, `));
  };

  public render() {
    const onSelectContact = this.clickOnHintItem[
      (this.props.formData.type || ({} as ISendAsOption)).value || MessageType.EMAIL
    ];
    const {type} = this.props.formData;
    const {handleSubmit, submitting} = this.props;
    const isEmail = type && (type as ISendAsOption).value === MessageType.EMAIL;
    const disableAttachedFiles = !type || (!!type && (type as ISendAsOption).value === MessageType.SMS);
    return (
      <>
        {submitting && <BlockLoading size={40} color={ColorPalette.white} />}
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="row">
            <StyledLabel className="col-2 col-form-label">Send As:</StyledLabel>
            <div className="col-2">
              <Field
                name="type"
                placeholder="Select..."
                validate={required}
                component={Select}
                options={EmailReplyTypes}
                disabled={this.props.disabled}
              />
            </div>
          </div>
          <div className="row">
            <StyledLabel className="col-2 col-form-label">To:</StyledLabel>
            <div className="col-5">
              <Field
                name="to"
                placeholder="Select..."
                validate={isEmail ? [required, email] : [required]}
                component={ContactsSearch}
                onSelect={(o: IContactAssignment) => onSelectContact(o, 'to')}
                assignedContacts={this.assignedContacts}
                contactValue={this.props.formData.to}
                loading={this.props.contacts.loading}
                disabled={this.props.disabled}
              />
            </div>
          </div>
          {isEmail && (
            <>
              <div className="row">
                <StyledLabel className="col-2 col-form-label">Cc:</StyledLabel>
                <div className="col-5">
                  <Field
                    name="cc"
                    placeholder="Select..."
                    component={ContactsSearch}
                    onSelect={(o: IContactAssignment) => this.onMultipleSelectContact(o, 'cc')}
                    validate={emails}
                    assignedContacts={this.assignedContacts}
                    contactValue={this.props.formData.cc}
                    multiple={true}
                    loading={this.props.contacts.loading}
                    disabled={this.props.disabled}
                  />
                </div>
              </div>
              <div className="row">
                <StyledLabel className="col-2 col-form-label">Bcc:</StyledLabel>
                <div className="col-5">
                  <Field
                    name="bcc"
                    placeholder="Select..."
                    component={ContactsSearch}
                    validate={emails}
                    assignedContacts={this.assignedContacts}
                    onSelect={(o: IContactAssignment) => this.onMultipleSelectContact(o, 'bcc')}
                    contactValue={this.props.formData.bcc}
                    multiple={true}
                    loading={this.props.contacts.loading}
                    disabled={this.props.disabled}
                  />
                </div>
              </div>
              <div className="row">
                <StyledLabel className="col-2 col-form-label">Subject:</StyledLabel>
                <div className="col-5">
                  <Field
                    name="subject"
                    placeholder="Subject..."
                    component={Input}
                    validate={isEmail ? required : undefined}
                    disabled={this.props.disabled}
                  />
                </div>
              </div>
            </>
          )}

          {type && (
            <LongAlert>
              This message will be sent to the specified{' '}
              {(type as ISendAsOption).value === MessageType.EMAIL ? 'email addresses' : 'phone number'}.{' '}
              <strong>Switch to a Note</strong> if you want to reply with an internal note.
            </LongAlert>
          )}

          <EditorWrapper>
            <Field
              name="body"
              placeholder="Enter body here..."
              component={TextEditorField}
              color={ColorPalette.blue0}
              onCancel={this.props.onCancel}
              onSave={this.saveDraft}
              postDocument={this.props.postDocument}
              validate={requiredHtml}
              disableAttachments={disableAttachedFiles}
              disableTextFormatting={!isEmail}
              disableMentionControl={!isEmail}
            />
            <EditorFooter>
              {type &&
                ((type as ISendAsOption).value === MessageType.SMS && (
                  <FooterPlaceholder>160 characters = 1 SMS</FooterPlaceholder>
                ))}
              <SubmitButton type="submit" disabled={this.props.submitting}>
                Send {type && ((type as ISendAsOption).value === MessageType.EMAIL ? 'Email' : 'SMS')}
              </SubmitButton>
            </EditorFooter>
          </EditorWrapper>
          {!disableAttachedFiles && (
            <AttachedFilesWrapper>
              <AttachedFiles documents={this.props.documents} onRemove={this.removeDocumentFromReply} />
            </AttachedFilesWrapper>
          )}
        </form>
      </>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  formData: getFormValues('EmailReplyForm')(state),
  contacts: state.currentJobContacts,
  editedReply: state.editedReply
});

export default compose<React.ComponentClass<IOwnProps & Partial<InjectedFormProps<{}>>>>(
  reduxForm<IFormData, IOwnProps>({
    form: 'EmailReplyForm',
    enableReinitialize: true
  }),
  connect(mapStateToProps)
)(EmailReplyForm);
