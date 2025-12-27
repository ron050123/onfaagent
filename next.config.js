/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is enabled by default in Next.js 13.4+
  
  // Exclude whatsapp-web.js from server components bundling
  // This package is not compatible with Next.js build and should only be used in standalone worker scripts
  serverComponentsExternalPackages: [
    'whatsapp-web.js',
    'puppeteer',
    'puppeteer-core',
  ],
  
  webpack: (config, { isServer }) => {
    // Exclude whatsapp-web.js from webpack bundling
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }
    
    // Mark whatsapp-web.js as external for server-side
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'whatsapp-web.js': 'commonjs whatsapp-web.js',
        'puppeteer': 'commonjs puppeteer',
        'puppeteer-core': 'commonjs puppeteer-core',
      });
    }
    
    return config;
  },
}

module.exports = nextConfig
