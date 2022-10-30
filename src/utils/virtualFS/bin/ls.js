function listDFS(parentDir) {
	const children = Object.keys(parentDir.children).filter(
		(i) => i !== "parent"
	);
	if (!children.length) return ["."];
	else {
		const files = [];
		children.forEach((child) => {
			if (parentDir.children[child].properties.permissions[0] !== "d")
				files.push(child);
			else {
				files.push("\n." + parentDir.children.parent + child + "\n");
				files.push(...listDFS(parentDir.children[child]));
			}
		});
		return files;
	}
}
function ls(argv, state) {
	const helpMessage = `Directory lister:
                        Usage:  ls <path> [<flags>]`;
	const returnState = { newState: {}, code: 0, message: "" };

	try {
		if (!argv.length) argv.push(".");
		if (argv[0] === "--help" || argv[0] === "-h") {
			returnState.message = helpMessage;
		} else {
			let parentDir = state.fs.getRoot()["/"];
			let files = [];
			try {
				// First fetch last node to begin ls from
				console.log(
					state.fs.createAbsolutePath(state.cwd, argv[0], state.user)
				);
				for (i of state.fs
					.createAbsolutePath(state.cwd, argv[0], state.user)
					.split("/")
					.filter((i) => i !== "")) {
					parentDir = parentDir.children[i];
				}
				if (argv.includes("-R")) files = listDFS(parentDir);
				else
					files = Object.keys(parentDir.children).filter(
						(i) => i != "parent"
					);
			} catch (e) {
				console.log(e);
				returnState.message = "Invalid path. Doesn't exist";
				return returnState;
			}
			returnState.message = files.join(" ");
		}
	} catch (e) {
		console.log(e);
		returnState.message = `Invalid use!
                    ${helpMessage}`;
	}
	return returnState;
}

module.exports = ls;
