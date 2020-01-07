import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import {Td} from 'src/components/Tables/PseudoTableItems';

const AddressColumn = styled.div`
  min-width: 300px;
`;

const RigthAlignedMenu = styled.div`
  float: right;
`;

const BolderHeader = styled.div`
  font-weight: bold;
  color: ${ColorPalette.black0};
`;

const MidleHeader = styled.div`
  font-weight: normal;
  color: ${ColorPalette.black0};
`;

const HighlightedTr = styled.div<{selected: boolean}>`
  display: table-row;
  background: ${props => (props.selected ? ColorPalette.gray2 : '')};
  cursor: pointer;
  &:not(:last-of-type) ${Td} {
    border-bottom: 1px solid ${ColorPalette.gray2} !important;
  }
  &:hover {
    background-color: ${props => (props.selected ? ColorPalette.gray2 : ColorPalette.semiGray)};
  }
`;

export {AddressColumn, RigthAlignedMenu, BolderHeader, MidleHeader, HighlightedTr};
