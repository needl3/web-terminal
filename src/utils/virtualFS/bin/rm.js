const helpMessage = `
					Remove file/directory
					Usage: rm <file>
						   rm -r <file/directory> for recursive deletion
						   `;
function rm(argv, state) {
	const finalState = { newState: {}, code: 0, message: "" };
	try {
		if (argv.includes("-r")) {
			finalState.message = "-r flag not supported yet";
			finalState.code = 1;
		} else {
			const targetNodeName = argv.filter((i) => !i.includes("-"))[0]; // Outrageous, what is this hacky sheep
			const absolutePath = state.fs.createAbsolutePath(
				state.cwd,
				targetNodeName,
				state.user
			);
			const absolutePathList = absolutePath
				.split("/")
				.filter((i) => i != "");
			const parentDir = state.fs.getNode(
				absolutePathList.slice(0, -1),
				state.user
			);
			const targetChild = parentDir.children[absolutePathList.at(-1)];
			if (targetChild.properties.permissions[0] === "d")
				throw Error(
					"Cannot remove a directory. Use -r flag for recursive directory removal.",
					{ cause: "intentional" }
				);
			state.fs.removeNode({
				cwd: state.cwd,
				path: absolutePath,
				user: state.user,
			});
		}
	} catch (e) {
		console.log(e);
		if (e.cause === "intentional") finalState.message = e.message;
		else finalState.message = "Invalid use" + helpMessage;
		finalState.code = 1;
	}
	return finalState;
}

module.exports = rm;
