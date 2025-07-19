/** @type {import('next').NextConfig} */
const nextConfig = {
eslint: {
  ignoreDuringBuilds: true,
},
typescript: {
  ignoreBuildErrors: true,
},
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'maps.googleapis.com',
      port: '',
      pathname: '/maps/api/**',
    },
  ],
  unoptimized: true,
},
webpack: (config, { isServer }) => {
  if (isServer) {
    config.externals.push('chrome-aws-lambda');
  }
  return config;
},
};

export default nextConfig;
