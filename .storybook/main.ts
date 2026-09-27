import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  // Components live in app/components (CLAUDE.md generates stories beside them)
  stories: [
    '../app/**/*.mdx',
    '../app/**/*.stories.@(ts|tsx)',
  ],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-mcp',
  ],
  framework: '@storybook/nextjs-vite',
  staticDirs: ['../public'],
};
export default config;
