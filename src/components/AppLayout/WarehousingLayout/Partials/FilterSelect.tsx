import * as React from 'react';
import InlineSelect, {IProps as IInlineSelectProps} from 'src/components/Form/InlineSelect';
import ColorPalette from 'src/constants/ColorPalette';
interface IProps {
  transformValueById?: boolean;
  onChange?: (option: any) => any;
}

export default React.memo((props: IInlineSelectProps & IProps) => {
  const {transformValueById, value, options} = props;
  const filterSelectStyles = {
    container: (base: React.CSSProperties) => ({
      ...base,
      flexBasis: '200px',
      minWidth: '180px',
      borderRadius: '4px',
      background: ColorPalette.gray0
    }),
    singleValue: (base: React.CSSProperties) => ({
      ...base,
      background: 'transparent',
      color: ColorPalette.gray5
    }),
    control: (base: React.CSSProperties) => ({
      ...base,
      border: 'none',
      boxShadow: 'none',
      background: '#f1f1f1',
      color: ColorPalette.gray5,
      minHeight: '33px'
    }),
    option: (base: React.CSSProperties, data: any) => ({
      ...base,
      color: !data.isSelected ? ColorPalette.gray5 : 'white'
    }),
    placeholder: (base: React.CSSProperties) => ({
      ...base,
      color: ColorPalette.blue1
    }),
    dropdownIndicator: (base: React.CSSProperties) => ({
      ...base,
      color: ColorPalette.gray5
    })
  };
  const resultValue = (transformValueById && options && options.find(el => el.id === value)) || value;
  return <InlineSelect {...props} value={resultValue} customStyles={filterSelectStyles} />;
});
