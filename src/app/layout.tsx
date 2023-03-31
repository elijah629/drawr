import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrains_mono = JetBrains_Mono({ subsets: ["latin"], weight: "500" });

export const metadata = {
	title: "Drawr",
	description: "An r/Place clone"
};

export default function RootLayout({
	children
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang="en"
			className="h-full">
			<body className={`h-full ${jetbrains_mono.className}`}>
				<main
					className="h-full"
					style={{
						background:
							"linear-gradient(0deg, #171717 0%, #3a3a3a 30%, #3a3a3a 70%, #171717 100%)"
					}}>
					{children}
				</main>
			</body>
		</html>
	);
}
