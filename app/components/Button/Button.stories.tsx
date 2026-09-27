import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  args: { children: 'Button' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Solid: Story = {};

export const Outline: Story = {
  args: { outline: true },
};

export const Plain: Story = {
  args: { plain: true },
};

export const Danger: Story = {
  args: { danger: true },
};

export const Loading: Story = {
  args: { loading: true },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--space-12)', alignItems: 'center' }}>
      <Button {...args} size="sm">Small</Button>
      <Button {...args} size="md">Medium</Button>
      <Button {...args} size="lg">Large</Button>
    </div>
  ),
};
