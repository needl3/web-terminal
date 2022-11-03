const helpMessage = `
		Echo: Write characters to stdin
		Usage: echo <string>
		`;
function echo(args, state) {
	const finalState = { newState: {}, code: 0, message: "" };
	const content = args[0];
	const redirect = args[1];
	const fileName = args[2];

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
				parentNode.children[absolutePath.at(-1)] = {
					...targetChild,
					content:
						redirect === ">"
							? content
							: targetChild.content + "\n" + content,
				};
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
