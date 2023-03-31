/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			borderRadius: {
				md: "5px"
			},
			borderColor: {
				DEFAULT: "#000"
			},
			boxShadow: {
				sm: "3px 3px #000",
				DEFAULT: "5px 5px #000",
				md: "10px 10px #000"
			}
		}
	},
	plugins: []
};
