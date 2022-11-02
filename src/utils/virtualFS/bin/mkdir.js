function mkdir(argv, state) {
	const finalState = { newState: {}, code: 0, message: "" };
	if (argv[0] === "--help" || argv[0] === "-h")
		finalState.message = `
		Create a directory
		Usage: mkdir <path>
	`;
	else {
		try{
			state.fs.makeNode({
				cwd: state.cwd,
				path: argv[0],
				file: null,
				user: state.user,
			})
		}catch(e) {
			console.log(e)
			finalState.code = 1;
			finalState.message = e.message
		}
	}
	return finalState;
}

module.exports = mkdir;
