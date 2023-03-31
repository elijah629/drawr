import nextPwa from "@murkrage/next-pwa";

const withPWA = nextPwa({
	dest: "public",
	disable: process.env.NODE_ENV === "development"
});

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
	experimental: {
		appDir: true
	}
});

export default nextConfig;
