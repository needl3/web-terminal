const helpMessage = `
					Remove file/directory
					Usage: rm <file>
						   rm -r <file/directory> for recursive deletion
	`;

function rmdir(argv, state) {
	const finalState = { newState: {}, code: 0, message: "" };
	if (argv[0] === "-h" || argv[0] === "--help") {
		finalState.message = helpMessage;
	} else {
		try {
			state.fs.removeNode({
				cwd: state.cwd,
				path: argv[0],
				user: state.user,
			});
		} catch (e) {
			console.log(e);
			if (e.cause === "intentional") finalState.message = e.message;
			else finalState.message = "Invalid use" + helpMessage;
			finalState.code = 1;
		}
	}
	return finalState;
}

module.exports = rmdir;
