function mkdir(argv, state) {
	const finalState = { newState: {}, code: 0, message: "" };
	if (argv[0] === "--help" || argv[0] === "-h")
		finalState.message = `
		Create a directory
		Usage: mkdir <path>
	`;
	else {
		if (
			state.fs.makeNode({
				cwd: state.cwd,
				path: argv[0],
				dir: true,
				user: state.user,
			})
		) {
			finalState.code = 1;
			finalState.message = "Cannot create directory at " + argv[0];
		}
	}
	return finalState;
}

module.exports = mkdir;
