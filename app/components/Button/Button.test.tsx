import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('calls onClick when pressed', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Send</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Send' }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is disabled while loading', () => {
    render(<Button loading>Send</Button>);

    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
  });

  it('renders a link when href is set', () => {
    render(<Button href="/docs">Docs</Button>);

    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs');
  });

  it('has no axe violations in each variant', async () => {
    const { container } = render(
      <>
        <Button>Solid</Button>
        <Button outline>Outline</Button>
        <Button plain>Plain</Button>
        <Button danger>Danger</Button>
      </>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
