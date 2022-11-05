const helpMessage = `
						Move files/directories
						Usage: chown <new_owner> <file/directory_path>
					`;
function mv(argv, state) {
	const finalState = { newState: {}, code: 0, message: "" };
	if (argv[0] === "-h" || argv[0] === "--help") {
		finalState.message = helpMessage;
		return finalState;
	}
	const destinationNodePath = state.fs.createAbsolutePath(state.cwd, argv.get(-1), state.user)
	const destinationNodePathList = destinationNodePath.split("/").filter(i=>i!=="")
	const destinationNodeParent = state.fs.getNode(destinationNodePathList.slice(0,-1), state.user)
	try {
		argv.slice(0, -1).forEach((targetNodeName) => {
			const targetNodePath = state.fs.createAbsolutePath(state.cwd, targetNodeName, state.user)
			const targetNode = JSON.parse(JSON.stringify(state.fs.getNode(targetNodePath.split("/").filter(i=>i!=""))))

			if(targetNode.properties.permissions[0] === "d"){
				const destinationNode = destinationNodeParent.children[destinationNodePathList.get(-1)]
				if(destinationNode && destinationNode.properties.permissions[0] !== "d") throw Error("Cannot move " + destinationNodePathList.at(-1) + " to " + targetNodePath.at(-1), {cause: "intentional"})
			}
		});
	} catch (e) {
		console.log(e);
		if (e.cause === "intentional") finalState.message = e.message;
		else finalState.message = "Invalid use" + helpMessage;
		finalState.code = 1;
	}
}

