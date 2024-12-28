//@ts-check

const { composePlugins, withNx } = require('@nx/next');
require('dotenv').config();

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  env: {
    MAPTILER_API_KEY: process.env.MAPTILER_API_KEY,
    REACT_APP_BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:8080',
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
