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
import {
  useEffect,
  useRef,
  useState,
  createPortal,
} from '@web-stories-wp/react';
import { useConfig, useStory } from '@web-stories-wp/story-editor';

/**
 * Internal dependencies
 */
import MetaBoxesArea from './metaBoxesArea';
import useMetaBoxes from './useMetaBoxes';
import useSaveMetaBoxes from './useSaveMetaBoxes';
import MenuItem from './menuItem';

const Wrapper = styled.div``;

function MetaBoxes() {
  const { metaBoxesVisible, hasMetaBoxes } = useMetaBoxes(({ state }) => ({
    hasMetaBoxes: state.hasMetaBoxes,
    metaBoxesVisible: state.metaBoxesVisible,
  }));
  const [showMenuButton, setMenuButton] = useState(false);
  const menuItemEl = useRef(null);

  const { isSavingStory, isAutoSavingStory, story } = useStory(
    ({
      state: {
        meta: { isSavingStory, isAutoSavingStory },
        story,
      },
    }) => ({ isSavingStory, isAutoSavingStory, story })
  );

  useSaveMetaBoxes({
    story,
    isSavingStory,
    isAutoSavingStory,
  });

  const { postType, metaBoxes = {} } = useConfig();

  useEffect(() => {
    const timeout = setTimeout(() => {
      menuItemEl.current = document.getElementById('primary-menu-items');
      setMenuButton(null !== menuItemEl.current);
    });

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    // Allow toggling metaboxes panels.
    // We need to wait for all scripts to load.
    // If the meta box loads the post script, it will already trigger this.
    // See https://github.com/WordPress/gutenberg/blob/148e2b28d4cdd4465c4fe68d97fcee154a6b209a/packages/edit-post/src/store/effects.js#L25-L35
    const timeout = setTimeout(() => {
      if (global.postboxes?.page !== postType) {
        global.postboxes?.add_postbox_toggles(postType);
      }
    });

    return () => {
      clearTimeout(timeout);
    };
  }, [postType]);

  if (!hasMetaBoxes) {
    return null;
  }

  const locations = Object.keys(metaBoxes);

  return (
    <>
      {metaBoxesVisible && (
        <Wrapper>
          {locations.map((location) => {
            return <MetaBoxesArea key={location} location={location} />;
          })}
        </Wrapper>
      )}
      {showMenuButton && createPortal(<MenuItem />, menuItemEl.current)}
    </>
  );
}

export default MetaBoxes;
