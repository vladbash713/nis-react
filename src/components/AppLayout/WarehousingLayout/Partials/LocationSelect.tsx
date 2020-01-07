import * as React from 'react';
import InlineSelect, {IProps as IInlineSelectProps} from 'src/components/Form/InlineSelect';
import ColorPalette from 'src/constants/ColorPalette';
interface IProps {
  transformValueById?: boolean;
  onChange?: (option: any) => any;
}

export default React.memo((props: IInlineSelectProps & IProps) => {
  const {transformValueById, value, options} = props;
  const locationSelectStyles = {
    container: (base: React.CSSProperties) => ({
      ...base,
      flexBasis: '200px',
      height: '33.5px',
      minWidth: '180px',
      border: `1px solid ${ColorPalette.blue2}`,
      fontWeight: 'lighter',
      fontSize: '1rem',
      borderRadius: '0.25rem',
      boxShadow: '0 0 0 !important',
      lineHeight: '1.5rem',
      paddingTop: 0
    }),
    singleValue: (base: React.CSSProperties) => ({
      ...base,
      background: 'transparent',
      color: ColorPalette.blue1
    }),
    valueContainer: (base: React.CSSProperties) => ({
      ...base,
      padding: ' 0px 8px'
    }),
    control: (base: React.CSSProperties) => ({
      ...base,
      border: 'none',
      boxShadow: 'none',
      background: 'transparent',
      color: ColorPalette.blue1,
      minHeight: 'auto',
      maxHeight: '31.5px !important'
    }),
    placeholder: (base: React.CSSProperties) => ({
      ...base,
      color: ColorPalette.blue1
    }),
    dropdownIndicator: (base: React.CSSProperties) => ({
      ...base,
      color: ColorPalette.blue1,
      padding: '6px'
    })
  };
  const resultValue = (transformValueById && options && options.find(el => el.id === value)) || value;
  return <InlineSelect {...props} value={resultValue} customStyles={locationSelectStyles} />;
});
