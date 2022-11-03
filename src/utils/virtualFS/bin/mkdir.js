const helpMessage = `
		Create a directory
		Usage: mkdir <path>
	`;

function mkdir(argv, state) {
	const finalState = { newState: {}, code: 0, message: "" };
	if (argv[0] === "--help" || argv[0] === "-h")
		finalState.message = helpMessage
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
			if(e.cause === "intentional") finalState.message = e.message
			else finalState.message = e.message
			finalState.code = 1;
		}
	}
	return finalState;
}

module.exports = mkdir;
