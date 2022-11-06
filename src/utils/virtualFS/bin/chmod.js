const helpMessage = `
						Change file permissions
						Usage: chmod <2 digit permission bits> <file_path>
					`;
function chmod(argv, state) {
	const finalState = { newState: {}, code: 0, message: "" };
	if (argv[0] === "-h" || argv[0] === "--help") {
		finalState.message = helpMessage;
		return finalState;
	}
	try{
		state.fs.editNode({cwd: state.cwd, path: argv[1], user: state.user, nodeProperties: { permissions: argv[0] }})
	}catch(e){
		console.log(e)
		if(e.cause === "intentional") finalState.message = e.message
		else finalState.message = "Invalid use" + helpMessage
		finalState.code = 1
	}
	return finalState;
}

module.exports = chmod
