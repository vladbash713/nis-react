import * as React from 'react';
import FullSidebarMenu from './FullSidebarMenu';
import SearchInput from '../SearchInput/SearchInput';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import ColorPalette from 'src/constants/ColorPalette';
import ReactTooltip from 'react-tooltip';
import {SidebarContext} from 'src/components/AppLayout/SidebarContextWrap';

interface IProps {
  onSearch: (data: any) => void;
  searchLoading?: boolean;
  searchPlaceholder?: string;
  hint?: string;
  loading?: boolean;
  children?: React.ReactNode;
}

function WarehouseSidebarMenu({loading, searchPlaceholder, children, hint, searchLoading, onSearch}: IProps) {
  return (
    <FullSidebarMenu>
      <ReactTooltip className="overlapping" effect="solid" place="right" id="warehouse-sidebar-tooltip" />
      <SidebarContext.Consumer>
        {sidebarContext =>
          sidebarContext.isOpen && (
            <div className="pl-4 pr-5 my-4">
              <SearchInput
                loading={!!searchLoading}
                onSearchValueChange={onSearch}
                placeholder={searchPlaceholder || 'Search...'}
              />
            </div>
          )
        }
      </SidebarContext.Consumer>
      <div className="position-relative">
        {loading && <BlockLoading size={40} color={ColorPalette.gray1} />}
        {children}
      </div>
    </FullSidebarMenu>
  );
}

export default WarehouseSidebarMenu;
