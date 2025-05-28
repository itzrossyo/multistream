/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.twitch.tv https://*.kick.com https://*.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; frame-src 'self' https://*.twitch.tv https://*.kick.com https://kick.com; connect-src 'self' https://*.twitch.tv https://*.kick.com https://*.cloudflareinsights.com; img-src 'self' data: https://*;",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
