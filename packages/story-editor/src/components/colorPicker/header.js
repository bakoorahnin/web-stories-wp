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
import { useRef, useEffect } from '@web-stories-wp/react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { __ } from '@web-stories-wp/i18n';
import {
  Button,
  Icons,
  BUTTON_SIZES,
  BUTTON_TYPES,
  BUTTON_VARIANTS,
} from '@web-stories-wp/design-system';

const HEADER_FOOTER_HEIGHT = 52;

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: ${HEADER_FOOTER_HEIGHT}px;
  padding: 8px;
  position: relative;
`;

const CloseButton = styled(Button)`
  margin-left: auto;
`;

function Header({ children, handleClose }) {
  const ref = useRef();
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <Wrapper>
      {children}
      <CloseButton
        aria-label={__('Close', 'web-stories')}
        onClick={handleClose}
        type={BUTTON_TYPES.TERTIARY}
        size={BUTTON_SIZES.SMALL}
        variant={BUTTON_VARIANTS.SQUARE}
        ref={ref}
      >
        <Icons.Cross />
      </CloseButton>
    </Wrapper>
  );
}

Header.propTypes = {
  children: PropTypes.node,
  handleClose: PropTypes.func.isRequired,
};

export default Header;
