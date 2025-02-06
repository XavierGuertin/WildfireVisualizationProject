import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';
const coverageTask = require('@cypress/code-coverage/task');

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'apps/frontend-e2e/src',
    }),
    baseUrl: 'http://127.0.0.1:3000', // Set only if NX doesn’t set it automatically
    setupNodeEvents(on, config) {
      coverageTask(on, config); // Enable code coverage tasks
      return config;
    },
    reporter: 'spec', // Optional: show test stats in the terminal
    reporterOptions: {
      mochaFile: 'cypress/results/test-output-[hash].xml',
    },
    supportFile: false,
    // specPattern: 'src/e2e/**.cy.{js,jsx,ts,tsx}', // Uncomment this if testing locally
  },
});
