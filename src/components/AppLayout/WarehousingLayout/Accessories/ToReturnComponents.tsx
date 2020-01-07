import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import PlainTable from 'src/components/Tables/PlainTable';
import {TextHeader} from 'src/components/Tables/DataGridHeader';
import {TextCell} from 'src/components/Tables/DataGridCell';

export const InventoryContent = styled.div`
  table:not(:first-child) {
    margin-top: 40px;
  }
`;

export const PaginationContent = styled.div`
  margin-top: 40px;
`;

export const InventoryTable = styled(PlainTable)`
  th {
    font-weight: ${Typography.weight.medium};
  }
`;

export const InventoryJobHeader = styled(TextHeader)`
  div {
    color: ${ColorPalette.black0};
    font-weight: ${Typography.weight.bold};
  }
`;

export const CheckBoxHeader = styled(TextHeader)`
  label {
    margin-top: 5px;
  }
`;

export const CheckBoxCell = styled(TextCell)`
  label {
    margin-top: 5px;
  }
`;
