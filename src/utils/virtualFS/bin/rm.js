const helpMessage = `
					Remove file/directory
					Usage: rm <file>
						   rm -r <file/directory> for recursive deletion
						   `;
function removeChildrenDFS(state, currentChildren) {
	const rejectedFileList = [];
	Object.keys(currentChildren)
		.filter((i) => i !== "parent")
		.forEach((child) => {
			if (currentChildren[child].properties.permissions[0] === "d") {
				rejectedFileList.push(
					...removeChildrenDFS(state, currentChildren[child].children)
				);
				try {
					state.fs.removeNode({
						cwd: "/",
						path: currentChildren.parent + "/" + child,
						user: state.user,
					});
				} catch (e) {
					rejectedFileList.push({
						child: currentChildren.parent + "/" + child,
						reason: e.message,
					});
				}
			} else {
				try {
					state.fs.removeNode({
						cwd: "/",
						path: currentChildren.parent + "/" + child,
						user: state.user,
					});
				} catch (e) {
					console.log(e);
					rejectedFileList.push({
						child: currentChildren.parent + "/" + child,
						reason: e.message,
					});
				}
			}
		});
	return rejectedFileList;
}
function rm(argv, state) {
	const finalState = { newState: {}, code: 0, message: "" };
	if (argv.includes("*")) {
		finalState.message =
			"Wildcards not supported. Delete parent directory instead";
		finalState.code = 1;
		return finalState;
	}
	const targetNodeName = argv.filter((i) => !i.includes("-"))[0]; // Outrageous, what is this hacky sheep
	const absolutePath = state.fs.createAbsolutePath(
		state.cwd,
		targetNodeName,
		state.user
	);
	const absolutePathList = absolutePath.split("/").filter((i) => i != "");
	try {
		if (argv.includes("-r")) {
			const rejectedFiles = removeChildrenDFS(
				state,
				state.fs.getNode(absolutePathList, state.user).children
			);
			try {
				state.fs.removeNode({
					cwd: state.cwd,
					path: targetNodeName,
					user: state.user,
				});
			} catch (e) {
				rejectedFiles.push({ child: absolutePath, reason: e.message });
			}
			finalState.message += rejectedFiles
				.map(
					(i) =>
						i.child.replace("/home/" + state.user, "~") +
						": " +
						i.reason
				)
				.join("\n");
		} else {
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
