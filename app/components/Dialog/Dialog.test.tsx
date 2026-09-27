import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Dialog, DialogTitle } from './Dialog';

describe('Dialog', () => {
  it('restores body scroll on close, even after re-rendering while open', () => {
    const { rerender } = render(<Dialog open onClose={() => {}}>Body</Dialog>);
    expect(document.body.style.overflow).toBe('hidden');

    // A parent re-render typically passes a new onClose function
    rerender(<Dialog open onClose={() => {}}>Body</Dialog>);
    rerender(<Dialog open={false} onClose={() => {}}>Body</Dialog>);

    expect(document.body.style.overflow).toBe('');
  });

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose}>
        <DialogTitle>Title</DialogTitle>
      </Dialog>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // The trap activates on the next animation frame. (jsdom has no layout, so
    // the trap's visibility filter finds nothing to focus; focus is untested here.)
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledOnce();
  });
});
