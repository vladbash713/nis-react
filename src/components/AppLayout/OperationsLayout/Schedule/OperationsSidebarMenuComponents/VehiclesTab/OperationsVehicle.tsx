import * as React from 'react';
import OperationsSidebarMenuUnitWrapper from 'src/components/AppLayout/OperationsLayout/Schedule/OperationsSidebarMenuComponents/OperationsSidebarMenuUnitWrapper';
import {ColoredDiv} from 'src/components/Layout/Common/StyledComponents';
import Typography from 'src/constants/Typography';
import {IVehicle} from 'src/models/IVehicle';
import ColorPalette from 'src/constants/ColorPalette';
import {ITag} from 'src/models/ITag';
import Tag from 'src/components/Tag/Tag';

export interface IInputProps {
  vehicle: IVehicle;
}

class OperationsVehicle extends React.PureComponent<IInputProps> {
  public render() {
    const {vehicle} = this.props;

    return (
      <OperationsSidebarMenuUnitWrapper>
        <ColoredDiv fontSize={Typography.size.smaller} className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <ColoredDiv
              weight={Typography.weight.bold}
              margin="0 10px 0 0"
              color={vehicle.is_booked ? ColorPalette.gray4 : ColorPalette.black1}
            >
              {vehicle.registration}
            </ColoredDiv>
            {vehicle.rent_starts_at && (
              <Tag tag={{name: 'RENTAL', color: ColorPalette.purple1} as ITag} mode="outlined" />
            )}
          </div>
          <ColoredDiv color={ColorPalette.gray4}>{vehicle.type.toUpperCase()}</ColoredDiv>
        </ColoredDiv>
      </OperationsSidebarMenuUnitWrapper>
    );
  }
}

export default OperationsVehicle;
