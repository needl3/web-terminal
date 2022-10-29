function depthFirstSearch(parentDir) {}
function ls(argv, state) {
	const helpMessage = `Files and directory lister:
                        Usage:  ls <path>`;
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
				for (i of state.fs
					.createAbsolutePath(state.cwd, argv[0])
					.split("/")
					.filter((i) => i !== "")) {
					parentDir = parentDir.children[i];
				}
				console.log(argv);
				files = Object.keys(parentDir.children).filter(
					(i) => i != "parent"
				);
				console.log(parentDir.children);
				console.log(files);
			} catch (e) {
				returnState.message = "Invalid directory path";
				return returnState;
			}
			returnState.message = files.join(" ");
		}
	} catch (e) {
		returnState.message = `Invalid use!
                    ${helpMessage}`;
	}
	return returnState;
}

module.exports = ls;
