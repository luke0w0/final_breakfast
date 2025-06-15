/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'vgbhxthksekpqcyyqemr.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/**',
            },
            { hostname:"lh3.googleusercontent.com" },
            { hostname:"avatars.githubusercontent.com" },
        ],
    },
}

module.exports = nextConfig 