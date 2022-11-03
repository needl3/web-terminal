const helpMessage = `
								Display file contents
								Usage: cat <file/path>
								`;
function cat(argv, state) {
	const returnState = { newState: {}, code: 0, message: "" };
	if (argv[0] === "--help" || argv[0] === "-h") {
		returnState.message = helpMessage;
	} else {
		const path = state.fs
			.createAbsolutePath(state.cwd, argv[0], state.user)
			.split("/")
			.filter((i) => i !== "");

		try {
			const file = state.fs.getNode(path, state.user);

			if (file.properties.permissions[0] === "d")
				throw Error("Error: Can't cat a directory", {
					cause: "intentional",
				});
			else returnState.message = file.content;
		} catch (e) {
			console.log(e);
			if (e.cause === "intentional") returnState.message = e.message;
			else returnState.message = "Invalid use\n" + helpMessage;
			returnState.code = 1;
		}
	}

	return returnState;
}

module.exports = cat;
