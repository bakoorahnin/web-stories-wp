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
import styled from 'styled-components';
import { __ } from '@web-stories-wp/i18n';
import { Icons, useGlobalKeyDownEffect } from '@web-stories-wp/design-system';
import { useEffect, useFocusOut, useRef } from '@web-stories-wp/react';

/**
 * Internal dependencies
 */
import { isKeyboardUser } from '../../utils/keyboardOnlyOutline';
import Popup from '../secondaryPopup';
import { ToggleButton } from '../toggleButton';
import { Z_INDEX } from '../canvas/layout';
import DirectionAware from '../directionAware';
import ShortcutMenu from './shortcutMenu';
import { TOGGLE_SHORTCUTS_MENU } from './constants';
import { useKeyboardShortcutsMenu } from './keyboardShortcutsMenuContext';

const StyledToggleButton = styled(ToggleButton)`
  padding-left: 3px;
  padding-right: 3px;
  width: auto;
`;

const Wrapper = styled.div`
  /**
    * sibling inherits parent z-index of Z_INDEX.EDIT
    * so this needs to be placed above that while still
    * retaining its position in the DOM for focus purposes
    */
  z-index: ${Z_INDEX.EDIT + 1};
`;
const MainIcon = styled(Icons.Keyboard)`
  height: 32px;
  width: auto;
  display: block;
`;
function KeyboardShortcutsMenu() {
  const anchorRef = useRef();
  const wrapperRef = useRef();
  const { close, toggle, isOpen } = useKeyboardShortcutsMenu(
    ({ actions: { close, toggle }, state: { isOpen } }) => ({
      close,
      toggle,
      isOpen,
    })
  );

  useEffect(() => {
    if (isKeyboardUser() && !isOpen) {
      // When menu closes, return focus to toggle menu button
      anchorRef?.current?.focus?.();
    }
  }, [isOpen]);

  useGlobalKeyDownEffect(TOGGLE_SHORTCUTS_MENU, toggle, [toggle]);
  useFocusOut(wrapperRef, close, [close]);

  return (
    <DirectionAware>
      <Wrapper ref={wrapperRef}>
        <Popup
          popupId="keyboard_shortcut_menu"
          isOpen={isOpen}
          ariaLabel={__('Keyboard Shortcuts', 'web-stories')}
        >
          <ShortcutMenu toggleMenu={toggle} />
        </Popup>

        <StyledToggleButton
          ref={anchorRef}
          isOpen={isOpen}
          aria-owns="keyboard_shortcut_menu"
          onClick={toggle}
          aria-label={__('Keyboard Shortcuts', 'web-stories')}
          label={__('Keyboard Shortcuts', 'web-stories')}
          MainIcon={MainIcon}
          shortcut="mod+/"
        />
      </Wrapper>
    </DirectionAware>
  );
}

export default KeyboardShortcutsMenu;
