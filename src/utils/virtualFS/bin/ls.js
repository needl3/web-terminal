function listDFS(parentDir, detailed, showHidden, user) {
	// This initial file resebles relative directory to which files after it are added
	const files = ["\n" + parentDir.children.parent + "/:\n"];

	if (
		!(
			parentDir.properties.permissions[1] === "r" &&
			user === parentDir.properties.owner
		) &&
		!(
			parentDir.properties.permissions[4] === "r" &&
			user !== parentDir.properties.owner
		)
	) {
		files.push("\n" + "Permission denied to read directory");
		return files;
	}
	const children = Object.keys(parentDir.children).filter((i) => {
		if (i != "parent") {
			if (i[0] === ".") return showHidden;
			return true;
		}
		return false;
	});

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
						parentDir.children[child].properties.owner +
						"\t" +
						child
				);
			else files.push(child);
		} else {
			if (detailed)
				files.push(
					"\n" +
						parentDir.properties.permissions +
						"\t" +
						parentDir.properties.owner +
						"\t" +
						child
				);
			else files.push(child);
			dfsList.push(parentDir.children[child]);
		}
	});
	// For a line break after a level
	files.push("\n-------------------------------------linebreak---------");
	dfsList.forEach((item) => {
		files.push(...listDFS(item, detailed, user));
	});
	return files;
}
function ls(argv, state) {
	const helpMessage = `Directory lister:
                        Usage:  ls <path/to/directory> [<flags>]`;
	const returnState = { newState: {}, code: 0, message: "" };

	if (!argv.length) argv.push(".");
	if (argv[0] === "--help" || argv[0] === "-h") {
		returnState.message = helpMessage;
		returnState.code = 1;
		return returnState;
	} else {
		let files = [];
		const path = argv.filter((i) => !i.includes("-"))[0];
		try {
			let parentDir = state.fs.getNode(
				state.fs
					.createAbsolutePath(state.cwd, path || ".", state.user)
					.split("/")
					.filter((i) => i !== ""),
				state.user
			);
			if (
				!(
					parentDir.properties.owner === state.user &&
					parentDir.properties.permissions[1] === "r"
				) &&
				!(
					parentDir.properties.permissions[4] === "r" &&
					parentDir.properties.owner !== state.user
				) &&
				state.user !== "root"
			)
				throw Error("Permission denied", { cause: "intentional" });
			// First fetch last node to begin ls from
			if (argv.includes("-R")) {
				files = listDFS(
					parentDir,
					argv.includes("-l"),
					argv.includes("-a"),
					state.user
				);
				files = files.map((file) =>
					file.replace(parentDir.children.parent, ".")
				);
			} else {
				for (child of Object.keys(parentDir.children).filter((i) => {
					if (i != "parent") {
						if (i[0] === ".") return argv.includes("-a");
						return true;
					}
					return false;
				})) {
					if (argv.includes("-l")) {
						files.push(
							"\n" +
								parentDir.children[child].properties
									.permissions +
								"\t" +
								parentDir.children[child].properties.owner +
								"\t" +
								child
						);
					} else {
						files.push(child);
					}
				}
			}
			returnState.message = files.join(" ");
		} catch (e) {
			console.log(e);
			if (e.cause === "intentional") returnState.message = e.message;
			else returnState.message = "Invalid use\n" + helpMessage;
			returnState.code = 1;
		}
	}
	return returnState;
}

module.exports = ls;
