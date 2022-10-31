function getFile(path, root) {
	for (let i=0;i<path.length;i++){
		if(root.children){
			root = root.children[path[i]]
		}
	}
	return root;
}
function cat(argv, state) {
	const returnState = { newState: {}, code: 0, message: "" };
	if (argv[0] === "--help" || argv[0] === "-h") {
		returnState.message = `
								Display file contents
								Usage: cat <file/path>
								`;
	} else {
		const path = state.fs
			.createAbsolutePath(state.cwd, argv[0], state.user)
			.split("/")
			.filter((i) => i !== "");
		try {
			const file = getFile(path, state.fs.getRoot()["/"]);
			if (file.properties.permissions[0] === "d") returnState.message = "Error: Can't cat a directory"
			else returnState.message = file.content
		} catch (e) {
			console.log(e);
			returnState.message = "No such file exists";
		}
	}

	return returnState;
}

module.exports = cat;
