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
import { waitFor } from '@testing-library/react';

/**
 * Internal dependencies
 */
import { Fixture } from '../../../karma';
import { useStory } from '../../../app';

describe('ColorPicker', () => {
  ['LTR', 'RTL'].forEach((direction) => {
    describe(`when document is in ${direction} mode`, () => {
      let fixture;

      beforeEach(async () => {
        fixture = new Fixture();
        fixture.setConfig({ isRTL: direction === 'RTL' });
        await fixture.render();
      });

      afterEach(() => {
        fixture.restore();
      });

      it('should display correctly', async () => {
        // Click the background element
        await fixture.events.click(
          fixture.editor.canvas.framesLayer.frames[0].node
        );

        const bgPanel = fixture.editor.inspector.designPanel.pageBackground;

        // Click the background page panel color preview
        await fixture.events.click(bgPanel.backgroundColor.button);

        await waitFor(() =>
          expect(bgPanel.backgroundColor.picker).toBeDefined()
        );

        // Snapshot it
        await fixture.snapshot('Basic color picker');

        // Go to the custom color picker as well and snapshot that too
        await fixture.events.click(bgPanel.backgroundColor.picker.custom);
        await fixture.snapshot('Custom color picker');
      });
    });
  });

  describe('Color Picker: Saved colors', () => {
    let fixture;

    beforeEach(async () => {
      fixture = new Fixture();
      await fixture.render();
      localStorage.setItem(
        'web_stories_ui_panel_settings:shapeStyle',
        JSON.stringify({ isCollapsed: false })
      );
    });

    afterEach(() => {
      fixture.restore();
      localStorage.clear();
    });

    const getSelection = async () => {
      const storyContext = await fixture.renderHook(() => useStory());
      return storyContext.state.selectedElements;
    };

    const getAddButton = (type) => {
      return fixture.screen.getByRole('button', {
        name: `Add ${type} color`,
      });
    };

    const getApplyButton = (pattern) => {
      return fixture.screen.getByRole('option', {
        name: pattern,
      });
    };

    const getEditButton = () => {
      return fixture.screen.getByRole('button', { name: /Edit colors/ });
    };

    const getExitEditButton = () => {
      return fixture.screen.getByRole('button', { name: /Exit edit mode/ });
    };

    const getDeleteButton = (type) => {
      if (type === 'global') {
        return fixture.screen.getByRole('option', {
          name: /Delete global color/,
        });
      }
      return fixture.screen.getByRole('option', {
        name: /Delete local color/,
      });
    };

    describe('CUJ: Creator can Apply or Save a Color from/to Their Preset Library: Add Colors', () => {
      it('should allow adding local colors', async () => {
        // Switch to shapes tab and click the triangle
        await fixture.events.click(fixture.editor.library.shapesTab);
        await fixture.events.click(
          fixture.editor.library.shapes.shape('Triangle')
        );

        await fixture.events.click(
          fixture.editor.inspector.designPanel.shapeStyle.backgroundColor.button
        );

        await fixture.events.click(getAddButton('global'));
        expect(getApplyButton('#c4c4c4')).toBeTruthy();
      });

      it('should allow adding global colors', async () => {
        // Switch to shapes tab and click the triangle
        await fixture.events.click(fixture.editor.library.shapesTab);
        await fixture.events.click(
          fixture.editor.library.shapes.shape('Triangle')
        );

        await fixture.events.click(
          fixture.editor.inspector.designPanel.shapeStyle.backgroundColor.button
        );

        await fixture.events.click(getAddButton('local'));
        expect(getApplyButton('#c4c4c4')).toBeTruthy();
      });

      it('should allow applying global colors', async () => {
        // Add shape and save its color.
        await fixture.events.click(fixture.editor.library.shapesTab);
        await fixture.events.click(
          fixture.editor.library.shapes.shape('Triangle')
        );
        await fixture.events.click(
          fixture.editor.inspector.designPanel.shapeStyle.backgroundColor.button
        );
        await fixture.events.click(getAddButton('global'));

        // Add text and apply the previously saved color.
        await fixture.events.click(fixture.editor.library.textAdd);
        await waitFor(() => fixture.editor.canvas.framesLayer.frames[1].node);
        await fixture.events.click(
          fixture.editor.inspector.designPanel.textStyle.fontColor.button
        );
        await fixture.events.click(getApplyButton('#c4c4c4'));
        const [text] = await getSelection();
        expect(text.content).toEqual(
          '<span style="color: #c4c4c4">Fill in some text</span>'
        );
      });

      it('should allow applying local colors', async () => {
        await fixture.events.click(fixture.editor.library.shapesTab);
        await fixture.events.click(
          fixture.editor.library.shapes.shape('Triangle')
        );
        await fixture.events.click(
          fixture.editor.inspector.designPanel.shapeStyle.backgroundColor.button
        );
        await fixture.events.click(getAddButton('local'));

        // Add text and apply the previously saved color.
        await fixture.events.click(fixture.editor.library.textAdd);
        await waitFor(() => fixture.editor.canvas.framesLayer.frames[1].node);
        await fixture.events.click(
          fixture.editor.inspector.designPanel.textStyle.fontColor.button
        );
        await fixture.events.click(getApplyButton('#c4c4c4'));
        const [text] = await getSelection();
        expect(text.content).toEqual(
          '<span style="color: #c4c4c4">Fill in some text</span>'
        );
      });
    });

    describe('CUJ: Creator can Apply or Save a Color from/to Their Preset Library: Manage Color Presets', () => {
      fit('should allow deleting local and global color presets', async () => {
        // Add text element and a color preset.
        await fixture.events.click(fixture.editor.library.textAdd);
        await waitFor(() => fixture.editor.canvas.framesLayer.frames[1].node);
        await fixture.events.click(
          fixture.editor.inspector.designPanel.textStyle.fontColor.button
        );
        await fixture.events.click(getAddButton('global'));
        await fixture.events.click(getAddButton('local'));

        await fixture.events.click(getEditButton());

        await fixture.snapshot('Color presets in edit mode');

        // Verify being in edit mode.
        const exitEditButton = getExitEditButton();
        expect(exitEditButton).toBeTruthy();

        const deleteGlobalButton = getDeleteButton('global');

        expect(deleteGlobalButton).toBeTruthy();

        // Delete global preset.
        await fixture.events.click(deleteGlobalButton);

        // Confirm both the color picker and the confirmation dialog are open since it's a global color.
        await waitFor(() => {
          expect(fixture.screen.getAllByRole('dialog').length).toBe(2);
        });
        await fixture.events.click(
          fixture.screen.getByRole('button', { name: 'Delete' })
        );

        // Delete local preset.
        await fixture.events.click(getDeleteButton('local'));

        // Verify the edit mode was exited (due to removing all elements).
        expect(() => getExitEditButton()).toThrow();

        // Verify there is no edit button either (since we have no presets left).
        expect(() => getEditButton()).toThrow();
      });
    });
  });
});
