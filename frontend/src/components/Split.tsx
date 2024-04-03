import type { ComponentChild } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

interface SplitProps {
  id?: string;
  children: [left: ComponentChild, right: ComponentChild];
}
export function Split({ id, children: panes }: SplitProps) {
  const firstHalfRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef<boolean>(false);

  const resize = (movementX: number) => {
    const firstHalf = firstHalfRef.current;
    if (!firstHalf || !isResizing.current) {
      return;
    }
    const percentage = (firstHalf.clientWidth + movementX) / firstHalf.parentElement!.clientWidth * 100;
    firstHalf.style.width = `${percentage}%`;
  }

  useEffect(() => {
    const handleMouseUp = () => {
      isResizing.current = false;
    };
    const handleMouseMove = (event: MouseEvent) => {
      resize(event.movementX);
    };
    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      resize(touch.clientX - firstHalfRef.current!.clientWidth);
    };
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);
  const handleMouseDown = () => {
    isResizing.current = true;
  };
  return (
    <div className="splitter" id={id}>
      <div style={{ width: '50%' }} ref={firstHalfRef}>{panes[0]}</div>
      <div
        className="gutter gutter-horizontal"
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      />
      {panes[1]}
    </div>
  );
}
