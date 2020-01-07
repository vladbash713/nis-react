import {connect} from 'react-redux';
import {reduxForm, getFormValues} from 'redux-form';
import {InvoiceDetailsValidator} from '../FinanceComponents/FinanceDetailsFormValidator';
import FinanceFormUnwrapped from '../FinanceComponents/FinanceFormUnwrapped';
import {IFormData} from '../FinanceComponents/FinanceFormUnwrapped';
import {IAppState} from '../../../../redux';

const InvoiceDetailsForm = reduxForm<IFormData, any>({
  form: 'InvoiceDetailsForm',
  validate: InvoiceDetailsValidator,
  enableReinitialize: true
})(FinanceFormUnwrapped);

const mapStateToProps = (state: IAppState) => ({
  formData: getFormValues('InvoiceDetailsForm')(state)
});

export default connect(mapStateToProps)(InvoiceDetailsForm);
