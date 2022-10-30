function getNode(root, path) {
	let i = 0;
	for (i = 0; i < path.length; i++) {
		if (root.children[path[i]] && root.children[path[i]].children)
			root = root.children[path[i]];
		else break;
	}
	if (i === path.length - 1) {
		if (root.children[path[i]]) return root.children[path[i]];
		else return root;
	} else return -1;
}
function echo(args, state) {
	const finalState = { newState: {}, code: 0, message: "" };
	const content = args[0];
	const redirect = args[1];
	const fileName = args[2];

	if (redirect === ">" || redirect === ">>") {
		const absolutePath = state.fs
			.createAbsolutePath(state.cwd, fileName, state.user)
			.split("/")
			.filter((i) => i !== "");
		const parentNode = getNode(state.fs.getRoot()["/"], absolutePath);
		if (parentNode !== -1) {
			if (parentNode.children === undefined)
				parentNode.content = (redirect === ">>") ? parentNode.content + "\n" + content : content;
			else
				parentNode.children[absolutePath.at(-1)] = {
					content: content,
					properties: { owner: state.user, permissions: "-rw-r--" },
				};
		} else{
			finalState.message = "No such file/directory"
			finalState.code = 1
		}
	}else{
		finalState.message = content
	}
	return finalState;
}

module.exports = echo;
