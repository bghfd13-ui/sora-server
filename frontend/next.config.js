const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, path.sep + 'config.json');
if (!fs.existsSync(configPath)) {
  throw new Error('Configuration could not be found at location: ' + configPath);
}
const config = JSON.parse(fs.readFileSync(configPath).toString('utf-8'));

module.exports = {
  reactStrictMode: true,
  serverRuntimeConfig: config.serverRuntimeConfig,
  publicRuntimeConfig: config.publicRuntimeConfig,
  async rewrites() {
    // The browser talks to Next.js on port 3000.  API routes are served by
    // the .NET website on port 5000, so proxy them here instead of returning
    // a Next.js 404 for every client-side /apisite request.
    return [
      {
        source: '/apisite/:path*',
        destination: `${process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:5000'}/apisite/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/catalog.aspx',
        destination: '/catalog',
        permanent: true,
      },
      /*
      {
        source: '/catalog/:id/:name',
        destination: '/redirect-item?id=:id',
        permanent: false,
      },
       */
      {
        source: '/groups/:id/:name',
        destination: '/My/Groups.aspx?gid=:id',
        permanent: false,
      },
    ]
  },
  webpack(config) {
    config.plugins = config.plugins.filter(plugin => {
      return plugin.constructor.name !== 'ReactFreshWebpackPlugin';
    });

    return config;
  }
}
