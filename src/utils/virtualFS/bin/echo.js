const helpMessage = `
		Echo: Write characters to stdin
		Usage: echo <string>
		`;
function echo(args, state) {
	const finalState = { newState: {}, code: 0, message: "" };
	const content = args[0];
	const redirect = args[1];
	const fileName = args[2];

	// Redirection although is not an argument in UNIX systems
	// It is considered as one here
	// because command chaining is far from implementation
	// And I want this to contain all basic utilities

	try {
		if (redirect === ">" || redirect === ">>") {
			const absolutePath = state.fs
				.createAbsolutePath(state.cwd, fileName, state.user)
				.split("/")
				.filter((i) => i !== "");
			const parentNode = state.fs.getNode(
				absolutePath.slice(0, -1),
				state.user
			);
			let targetChild = parentNode.children[absolutePath.at(-1)];
			if (targetChild)
				state.fs.editNode({cwd: state.cwd, path: fileName, user: state.user,  nodeContent: {add: redirect === ">>", content: content}})
			else
				state.fs.makeNode({
					cwd: state.cwd,
					path: fileName,
					file: content,
					user: state.user,
				});
		} else finalState.message = content;
	} catch (e) {
		console.log(e);
		if (e.cause === "intentional") finalState.message = e.message;
		else finalState.message = "Invalid use\n" + helpMessage;
		finalState.code = 1;
	}
	return finalState;
}

module.exports = echo;
