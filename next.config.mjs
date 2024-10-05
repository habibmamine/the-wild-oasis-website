/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tyjfaisnvcopdqblukqh.supabase.co",
        port: "",
        pathname: "/storage/v1/object/sign/cabin-images/**",
      },
    ],
  },
};

export default nextConfig;
