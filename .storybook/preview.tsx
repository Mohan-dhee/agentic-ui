import type { Preview } from '@storybook/nextjs-vite';
import { fontVariables } from '../app/fonts';
import '../app/globals.css';

// Tokens in globals.css resolve --font-* on :root, so the font classes must
// sit on <html>, matching app/layout.tsx.
document.documentElement.classList.add(...fontVariables.split(' '));

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
