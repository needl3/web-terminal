const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = (env, argv) => {
	return {
		entry: path.resolve(__dirname, "./src/index.js"),
		output: {
			filename: "[name].bundle.js",
			path: path.resolve(__dirname, "public"),
			clean: true,
		},
		mode: argv.mode === "development" ? "development" : "production",
		devServer: {
			static: path.resolve(__dirname, "public"),
			compress: true,
			port: 3000,
		},
		resolve: {
			extensions: [".js", ".jsx"],
		},
		optimization: {
			splitChunks: {
				chunks: "all",
			},
		},
		devtool: "inline-source-map",
		module: {
			rules: [
				{
					test: /\.s[ac]ss$/i,
					use: ["style-loader", "css-loader", "sass-loader"],
				},
				{
					test: /\.js$/,
					exclude: /node_modules/,
					use: {
						loader: "babel-loader",
					},
				},
				{
					test: /\.jsx$/,
					exclude: /node_modules/,
					use: {
						loader: "babel-loader",
					},
				},
			],
		},
		plugins: [
			new HtmlWebpackPlugin({
				title: "Terminal",
			}),
		],
	};
};
