function listDFS(parentDir, detailed) {
	const children = Object.keys(parentDir.children).filter(
		(i) => i !== "parent"
	);
	const parentName = parentDir.children.parent;

	// This initial file resebles relative directory to which files after it are added
	const files = ["\n" + parentName + "/:\n"];

	// To iterate further down listed directories
	// After all entities are listed first
	const dfsList = [];

	children.forEach((child) => {
		if (parentDir.children[child].properties.permissions[0] !== "d") {
			if (detailed)
				files.push(
					"\n" +
						parentDir.children[child].properties.permissions +
						"\t" +
						child
				);
			else files.push(child);
		} else {
			if (detailed) {
				files.push(
					"\n" + parentDir.properties.permissions + "\t" + child
				);
				dfsList.push(parentDir.children[child]);
			} else {
				files.push(child);
				dfsList.push(parentDir.children[child]);
			}
		}
	});
	// For a line break after a level
	files.push("\n-------------------------------------linebreak---------");
	dfsList.forEach((item) => {
		files.push(...listDFS(item, detailed));
	});
	return files;
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
			let files = [];
			const path = argv[0].includes("-") ? "." : argv[0];
			let parentDir = state.fs.getNode(
				state.fs
					.createAbsolutePath(state.cwd, path, state.user)
					.split("/")
					.filter((i) => i !== "")
			);
			try {
				// First fetch last node to begin ls from
				if (argv.includes("-R")) {
					files = listDFS(parentDir, argv.includes("-l"));
					files = files.map((file) =>
						file.replace(parentDir.children.parent, ".")
					);
				} else {
					for (child of Object.keys(parentDir.children).filter(
						(i) => i != "parent"
					)) {
						if (argv.includes("-l")) {
							files.push(
								"\n" +
									parentDir.children[child].properties
										.permissions +
									"\t" +
									child
							);
						} else {
							files.push(child);
						}
					}
				}
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
