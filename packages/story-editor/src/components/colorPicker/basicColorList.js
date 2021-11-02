/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import {
  PatternPropType,
  generatePatternStyles,
  hasOpacity,
  hasGradient,
} from '@web-stories-wp/patterns';
import { Icons, Swatch, themeHelpers } from '@web-stories-wp/design-system';
import { useRef } from '@web-stories-wp/react';
import { __ } from '@web-stories-wp/i18n';

/**
 * Internal dependencies
 */
import useRovingTabIndex from '../../utils/useRovingTabIndex';
import Tooltip from '../tooltip';
import ColorAdd from './colorAdd';

const focusStyle = css`
  ${({ theme }) =>
    themeHelpers.focusableOutlineCSS(
      theme.colors.border.focus,
      theme.colors.bg.secondary
    )};
`;

const SwatchList = styled.div.attrs({
  role: 'listbox',
})`
  display: flex;
  max-width: 100%;
  flex-wrap: wrap;
  gap: 6px;
`;

const StyledSwatch = styled(Swatch).attrs(({ isSelected }) => ({
  role: 'option',
  'aria-selected': isSelected,
}))`
  ${focusStyle};

  ${({ isSelected, theme }) =>
    isSelected &&
    css`
      border: 2px solid ${theme.colors.border.defaultActive};
    `}
`;

function getPatternAsString(pattern) {
  if (!pattern) {
    return '';
  }
  const styles = generatePatternStyles(pattern);
  return styles.backgroundColor || styles.backgroundImage;
}

function BasicColorList({
  color,
  colors,
  handleClick,
  allowsOpacity,
  allowsGradient,
  colorType = null,
  isEditMode,
  ...rest
}) {
  const colorAsBackground = getPatternAsString(color);
  const listRef = useRef(null);

  useRovingTabIndex({ ref: listRef });

  const selectedSwatchIndex = colors
    .map(getPatternAsString)
    .findIndex((c) => colorAsBackground === c);

  const isLocal = 'local' === colorType;
  const isGlobal = 'global' === colorType;

  const deleteLabel = isLocal
    ? __('Delete local color', 'web-stories')
    : __('Delete global color', 'web-stories');

  let applyLabel = __('Apply color', 'web-stories');
  if (isLocal || isGlobal) {
    applyLabel = isLocal
      ? __('Apply local color', 'web-stories')
      : __('Apply global color', 'web-stories');
  }

  let firstIndex = 0;
  return (
    <SwatchList ref={listRef} {...rest}>
      {colors.map((pattern, i) => {
        const isTransparentAndInvalid = !allowsOpacity && hasOpacity(pattern);
        const isGradientAndInvalid = !allowsGradient && hasGradient(pattern);
        const isDisabled = isTransparentAndInvalid || isGradientAndInvalid;
        let tooltip = null;
        if (isDisabled && !isEditMode) {
          tooltip = isTransparentAndInvalid
            ? __(
                'Page background colors cannot have an opacity.',
                'web-stories'
              )
            : __('Gradient not allowed for Text', 'web-stories');
        }

        const patternAsBackground = getPatternAsString(pattern);
        const isSelected = colorAsBackground === patternAsBackground;
        // By default, the first swatch can be tabbed into, unless there's a selected one.
        let tabIndex = i === firstIndex ? 0 : -1;
        if (selectedSwatchIndex >= 0) {
          tabIndex = isSelected ? 0 : -1;
        } else if (isDisabled && i === firstIndex) {
          firstIndex++;
          tabIndex = -1;
        }
        return (
          <Tooltip key={patternAsBackground} title={tooltip}>
            <StyledSwatch
              onClick={() => handleClick(pattern, isLocal)}
              pattern={pattern}
              isSelected={isSelected}
              isDisabled={isDisabled}
              tabIndex={tabIndex}
              title={patternAsBackground}
              aria-label={isEditMode ? deleteLabel : applyLabel}
            >
              {isEditMode && <Icons.Cross />}
            </StyledSwatch>
          </Tooltip>
        );
      })}
      {colorType && <ColorAdd type={colorType} />}
    </SwatchList>
  );
}

BasicColorList.propTypes = {
  handleClick: PropTypes.func.isRequired,
  allowsOpacity: PropTypes.bool,
  allowsGradient: PropTypes.bool,
  color: PatternPropType,
  colors: PropTypes.arrayOf(PatternPropType),
  colorType: PropTypes.string,
  isEditMode: PropTypes.bool.isRequired,
};

export default BasicColorList;
