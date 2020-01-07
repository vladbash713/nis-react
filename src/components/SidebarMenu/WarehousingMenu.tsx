import * as React from 'react';
import FullSidebarMenu from './FullSidebarMenu';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import ColorPalette from 'src/constants/ColorPalette';
import ReactTooltip from 'react-tooltip';

interface IProps {
  hint?: string;
  loading?: boolean;
  children?: React.ReactNode;
}

function WarehousingMenu({loading, children}: IProps) {
  return (
    <FullSidebarMenu>
      <ReactTooltip className="overlapping" effect="solid" place="right" id="finance-sidebar-tooltip" />
      <div className="position-relative">
        {loading && <BlockLoading size={40} color={ColorPalette.gray1} />}
        {children}
      </div>
    </FullSidebarMenu>
  );
}

export default WarehousingMenu;
