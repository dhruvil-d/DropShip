import { useEffect } from 'react';
import { useEditor } from '@craftjs/core';

/**
 * Listens for Delete / Backspace key presses and removes
 * the currently selected Craft.js node (if it's deletable).
 * Ignores key presses when the user is typing in an input/textarea.
 */
export const useDeleteKeyHandler = () => {
  const { actions, selected } = useEditor((state, query) => {
    const nodeId = Array.from(state.events.selected)[0];
    let sel;
    if (nodeId) {
      sel = {
        id: nodeId,
        isDeletable: query.node(nodeId).isDeletable(),
      };
    }
    return { selected: sel };
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;

      // Don't intercept when user is typing in a form field
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if ((e.target as HTMLElement)?.isContentEditable) return;

      if (selected?.isDeletable) {
        e.preventDefault();
        actions.delete(selected.id);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selected, actions]);
};
