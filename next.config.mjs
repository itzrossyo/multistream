/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: "frame-ancestors 'self' https://*.twitch.tv https://*.kick.com;",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
