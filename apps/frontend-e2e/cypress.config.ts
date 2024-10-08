import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';
const coverageTask = require('@cypress/code-coverage/task'); // Use require instead of import

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'src',
      webServerCommands: { default: 'npx nx run frontend:serve' },
      ciWebServerCommand: 'npx nx run frontend:serve-static',
      ciBaseUrl: 'http://localhost:3000',
    }),
    baseUrl: 'http://127.0.0.1:3000',
    setupNodeEvents(on, config) {
      coverageTask(on, config); // Enable code coverage tasks
      return config;
    },
    reporter: 'spec', // Show test statistics in the terminal
    reporterOptions: {
      mochaFile: 'cypress/results/test-output-[hash].xml',
    },
  },
});
