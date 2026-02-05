import { useEffect } from 'react';
import { useReactFlow, useKeyPress } from '@xyflow/react';
import { useDiagramStore } from './use-diagram-store';

export const useShortcuts = () => {
  const { addEntity, addAttribute } = useDiagramStore();
  const { getNodes } = useReactFlow();

  // We can use standard window event listeners for more control than useKeyPress
  // especially for combinations like Shift+N
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Shift + N: Add new Table
      if (event.shiftKey && (event.key === 'N' || event.key === 'n')) {
        event.preventDefault();
        addEntity();
      }

      // Shift + A: Add Attribute to selected Node
      if (event.shiftKey && (event.key === 'A' || event.key === 'a')) {
        event.preventDefault();
        const selectedNodes = getNodes().filter(n => n.selected);
        if (selectedNodes.length === 1) {
          addAttribute(selectedNodes[0].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addEntity, addAttribute, getNodes]);
};
