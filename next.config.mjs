/** @type {import('next').NextConfig} */
const nextConfig = {
    images:{
        
        domains: ["via.placeholder.com", "source.unsplash.com"],
        domains: ["dummyimage.com", "source.unsplash.com", "via.placeholder.com"],
        remotePatterns: [{hostname: "images.pexels.com"}],
        remotePatterns: [{hostname: "images.unsplash.com"}]
    }
};

export default nextConfig;
