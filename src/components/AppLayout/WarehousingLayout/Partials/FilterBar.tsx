import * as React from 'react';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import {IWrappedSelectOption} from 'src/components/Form/Select';
import Select from 'react-select';
import selectStyles from 'src/components/Form/commonSelectStyles';

const FiltersWrapper = styled.div`
  margin-bottom: 30px;
`;

const Filters = styled.div<{visible: boolean}>`
  display: ${props => (props.visible ? 'flex' : 'none')};
  justify-content: flex-start;
  align-items: center;
  flex-shrink: 0;
  margin-top: 30px;
`;

const ToggleLink = styled.a`
  color: ${ColorPalette.blue1} !important;
  cursor: pointer;
  &:hover {
    text-decoration: underline !important;
  }
`;

const FilterGroup = styled.div`
  margin-right: 10px;
`;

const FilterLabel = styled.div`
  color: ${ColorPalette.gray3};
  margin-bottom: 7px;
`;

const Input = styled.input`
  background-color: #f7f7f7;
  border-radius: 4px;
  border: none;
  width: 100%;
  padding: 0.375rem 0.75rem;
  min-height: 33.5px;
`;

export interface IFilter {
  label: string;
  filterKey: string;
  options: IWrappedSelectOption[];
  defaultValue: IWrappedSelectOption;
  type?: string;
}

export interface IFilterBarProps {
  filters: IFilter[];
  handleChange: (label: string, event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface IFilterBarState {
  expanded: boolean;
}

export default class FilterBar extends React.Component<IFilterBarProps, IFilterBarState> {
  public state = {
    expanded: false
  };

  private toogleBar = () => {
    this.setState({expanded: !this.state.expanded});
  };

  private getFilterStyle = () => {
    return {
      ...selectStyles,
      container: (base: React.CSSProperties) => ({
        ...base,
        minWidth: '200px'
      })
    };
  };

  public render() {
    const {expanded} = this.state;
    const {filters} = this.props;

    return (
      <FiltersWrapper>
        <ToggleLink onClick={this.toogleBar}>{expanded ? 'Hide Filter' : 'Show Filter'}</ToggleLink>
        {
          <Filters visible={expanded}>
            {' '}
            {filters.map(filter => {
              return (
                <FilterGroup key={filter.label}>
                  <FilterLabel>{filter.label}</FilterLabel>
                  {filter.type === 'text' ? (
                    <Input onChange={(e: any) => this.props.handleChange(filter.filterKey, e)} />
                  ) : (
                    <Select
                      styles={this.getFilterStyle()}
                      onChange={(e: any) => this.props.handleChange(filter.filterKey, e)}
                      options={filter.options}
                    />
                  )}
                </FilterGroup>
              );
            })}
          </Filters>
        }
      </FiltersWrapper>
    );
  }
}
