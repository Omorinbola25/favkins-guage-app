/**
 * Image Hosts Configuration (add your image hosts here)
 */

/** @type {NonNullable<NonNullable<import('next').NextConfig['images']>['remotePatterns']>} */
export const imageHosts = [
    {
        protocol: 'https',
        hostname: 'images.unsplash.com',
    },
    {
        protocol: 'https',
        hostname: 'images.pexels.com',
    },
    {
        protocol: 'https',
        hostname: 'images.pixabay.com',
    },
    {
        protocol: 'https',
        hostname: 'img.rocket.new',
    },
];
