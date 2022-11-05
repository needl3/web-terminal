const helpMessage = `
							Change directory
							Usage: cd <path>
							`;
function cd(argv, state) {
	//
	// I know this isn't accurate implementation but hey
	// this is in principal the same and I don't want to
	// do the accurate way rn, sorry
	//
	const finalState = { newState: {}, code: 0, message: "" };
	if (argv[0] === "-h" || argv[0] === "--help") {
		finalState.message = helpMessage;
	} else {
		const path = state.fs
			.createAbsolutePath(state.cwd, argv[0], state.user)
			.split("/")
			.filter((i) => i !== "");
		try {
			// Retrieve the node after proper validation
			const node = state.fs.getNode(path, state.user);
			// Now validate if the user has permission to enter it
			if (
				(node.properties.owner === state.user &&
					node.properties.permissions[3] === "x") ||
				(node.properties.permissions[6] === "x" &&
					node.properties.owner !== state.user) ||
				state.user === "root"
			)
				finalState.newState.cwd = node.children.parent.replace(
					"/home/" + state.user,
					"~"
				);
			else throw Error("Permission denied.", { cause: "intentional" });
		} catch (e) {
			console.log(e);
			if (e.cause === "intentional") finalState.message = e.message;
			else finalState.message = "Invalid use\n" + helpMessage;
			finalState.code = 1;
		}
	}
	return finalState;
}

module.exports = cd;
