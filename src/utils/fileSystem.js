/*
Regarding Permissions:
    - groups not implemneted
    - only use 2 digit numbers for permission (owner, others)
*/

// Register you system binaries here to list in ls
// Blame fs for browser for this inconvenience
const sysBinaries = ["ls", "clear", "whoami", "mkdir", "echo", "cat", "cd"];

// Templates for empty nodes
const directoryTemplate = (user, parentNodeName, permission) => {
	return {
		properties: { owner: user, permissions: permission || "drwxr-x" },
		children: {
			parent: parentNodeName,
		},
	};
};
const fileTemplate = (user, permission, file) => {
	return {
		properties: { owner: user, permissions: permission || "-rw-r--" },
		content: file || "",
	};
};
export default function fileSystem() {
	// To create a starting point in filesystem
	// All of the files are children of /
	let _root = {
		"/": {
			properties: {
				owner: "root",
				permissions: "drwxr-x",
			},
			children: {
				parent: "/",
			},
		},
	};
	// Initialize pre-shipped binaries
	makeNode({
		user: "root",
		cwd: "/",
		path: "bin",
		file: null,
	});
	sysBinaries.forEach((bin) => {
		makeNode({
			user: "root",
			cwd: "/bin/",
			path: bin,
			file: "<**binary noises**>",
			permission: "-r-xr-x",
		});
	});

	// Create home dir for Oxsiyo user(default)
	makeNode({
		user: "root",
		cwd: "/",
		path: "home",
		file: null,
	});
	makeNode({
		user: "Oxsiyo",
		cwd: "/",
		path: "home/Oxsiyo",
		file: null,
		pseudoRoot: true,
	});

	// Test file
	makeNode({
		user: "root",
		cwd: "/",
		path: "home/Oxsiyo/byRoot.txt",
		permission: "-rw--wx",
		file: "This is content used to distinguish between file and directory",
	});
	makeNode({
		user: "Oxsiyo",
		cwd: "/",
		path: "home/Oxsiyo/dir",
		file: null,
		permission: "drwxr-x",
	});
	makeNode({
		user: "Oxsiyo",
		cwd: "/",
		path: "home/Oxsiyo/dir/newdir",
		file: null,
		permission: "drwxr-x",
	});
	makeNode({
		user: "Oxsiyo",
		cwd: "/",
		path: "home/Oxsiyo/dir/newdir/temp.txt",
		file: "This is content used to permission test",
	});
	function getRoot() {
		return _root;
	}
	function createAbsolutePath(cwd, path, user) {
		// Resolve cwd
		cwd = cwd
			.replace("~", "/home/" + user)
			.split("/")
			.filter((i) => i !== "");

		// Resolve path
		path = path.replace("~", "/home/" + user + "/");
		if (path[0] === "/") return path;
		path.split("/")
			.filter((i) => i !== "")
			.forEach((node) => {
				if (node === "..") cwd.pop();
				else if (node !== ".") cwd.push(node);
			});
		return "/" + cwd.join("/");
	}
	function getNode(absolutePathList, user) {
		let parentDir = getRoot()["/"];
		for (let i of absolutePathList) {
			if (
				// owner + +x or others + +x
				(parentDir.properties.owner === user &&
					parentDir.properties.permissions[3] === "x") ||
				(parentDir.properties.permissions[6] === "x" &&
					parentDir.properties.owner !== user)
			)
				parentDir = parentDir.children[i];
			else throw Error("Permission denied", { cause: "intentional" });
		}
		if (!parentDir)
			throw Error("Error: No file/directory with that name", {
				cause: "intentional",
			});
		return parentDir;
	}
	function editNode({ cwd, path, user, nodeContent, nodeProperties }) {
		/*
		 API info
		 nodeName = String, 							// New name for the file/directory
		 nodeContent = {
		 	add: bool,
			content: String
			}, 											// add represents concat request
		nodeProperties: {
			owner: String,
			permissions: String 						// permission bits

			Node: Donot initialize all these three fields at once
			If all are initialized only the first will take effect
		 */
		const absolutePathList = createAbsolutePath(cwd, path, user)
			.split("/")
			.filter((i) => i !== "");
		const parentNode = getNode(absolutePathList.slice(0, -1), user);
		const targetChild = parentNode.children[absolutePathList.at(-1)];
		if (nodeProperties) {
			if (nodeProperties.owner) {
				if (user !== "root")
					throw Error("Cannot change ownership. Permission denied", {
						cause: "intentional",
					});
				parentNode.children[absolutePathList.at(-1)].properties.owner =
					nodeContent.owner;
			} else if (nodeProperties.permissions) {
				if (user !== targetChild.properties.owner)
					throw Error(
						"Changing permissions. Operation not permitted",
						{ cause: "intentional" }
					);
				parentNode.children[
					absolutePathList.at(-1)
				].properties.permissions = getBinaryString(
					nodeProperties.permissions
				);
			}
		} else if (nodeContent) {
			// Verify permission
			const permission = targetChild.properties.permissions;
			if (
				(user === targetChild.properties.owner &&
					permission[2] === "w") ||
				(user !== targetChild.properties.owner && permission[5] === "w")
			) {
				parentNode.children[absolutePathList.at(-1)].content =
					nodeContent.add === true
						? targetChild.content + "\n"
						: "" + nodeContent.content;
			} else
				throw Error("Cannot write to the file. Permission denied", {
					cause: "intentional",
				});
		} else throw Error("Invalid use");
	}

	function removeNode({ cwd, path, user }) {
		/*
		 If the node is supposed to be a directory
		 Make sure it's empty
		 Else deletion is not possible and throws Error
		 */
		const absolutePathList = createAbsolutePath(cwd, path, user)
			.split("/")
			.filter((i) => i !== "");
		const parentNode = getNode(absolutePathList.slice(0, -1));
		const targetChild = parentNode.children[absolutePathList.at(-1)];
		if (!targetChild)
			throw Error("No file/directory with that name", {
				cause: "intentional",
			});
		if (
			// First check if directory is writable
			// Then check if the node to be deleted is writable
			!(
				(((parentNode.properties.permissions[2] === "w" &&
					parentNode.properties.owner === user) ||
					(parentNode.properties.permissions[5] === "w" &&
						parentNode.properties.owner !== user)) &&
					targetChild.properties.permissions[2] === "w" &&
					targetChild.properties.owner === user) ||
				(targetChild.properties.permissions[5] === "w" &&
					targetChild.properties.owner !== user)
			)
		)
			throw Error("Cannot remove file. Permission denied", {
				cause: "intentional",
			});
		if (
			targetChild.properties.permissions[0] === "d" &&
			Object.keys(targetChild.children).filter((i) => i !== "parent")
				.length
		)
			throw Error("Cannot remove. Directory not empty.", {
				cause: "intentional",
			});
		delete parentNode.children[absolutePathList.at(-1)];
	}

	function makeNode({ cwd, path, file, user, permission, pseudoRoot }) {
		//
		// pseudoRoot is temporary fix and subject to change soon
		//
		const absolutePath = createAbsolutePath(cwd, path, user)
			.split("/")
			.filter((i) => i !== "");
		const parentNodeName = "/" + absolutePath.join("/");
		const parentNode = getNode(absolutePath.slice(0, -1), user);
		if (parentNode) {
			const parentPermission = parentNode.properties.permissions;
			if (parentPermission[0] === "d") {
				if (user === parentNode.properties.owner) {
					if (parentPermission[2] === "w") {
						// Write access granted
						parentNode.children[absolutePath.at(-1)] =
							file === null
								? directoryTemplate(
										user,
										parentNodeName,
										permission
								  )
								: fileTemplate(user, permission, file);
					} else {
						throw Error("Write permission denied", {
							cause: "intentional",
						});
					}
				} else if (
					parentPermission[5] === "w" ||
					user === "root" ||
					pseudoRoot
				) {
					// Write access Granted
					parentNode.children[absolutePath.at(-1)] =
						file === null
							? directoryTemplate(
									user,
									parentNodeName,
									permission
							  )
							: fileTemplate(user, permission, file);
				} else
					throw Error("Permission denied", { cause: "intentional" });
			} else {
				throw Error(
					"mkdir: cannot create directory " +
						path +
						": not a directory",
					{ cause: "intentional" }
				);
			}
		}
		return 0;
	}
	function getBinaryString(number) {
		if (number > 7)
			throw Error("Permission bit can't exceed 7", {
				cause: "intentional",
			});
		const maxDigits = 3;
		const binString = [];
		number.split("").forEach((n) => {
			const binStringTemp = [];
			while (n) {
				binStringTemp.unshift(n % 2);
				n = parseInt(n / 2);
			}
			binString.push(
				...[
					...binStringTemp,
					...new Array(maxDigits - binStringTemp.length).fill(0),
				]
			);
		});
		return binString.join("");
	}
	function transformNumericalPermission(number) {
		try {
			// Remove slice to enable group permissions
			// After you've implemented required checkers
			return getBinaryString(String(number).slice(0, 2));
		} catch (e) {
			throw Error("Invalid permission type.", { cause: "intentional" });
		}
	}
	function permissionParser(permission) {
		try {
			transformNumericalPermission(permission);
		} catch (e) {
			console.log(e);
		}
	}
	return {
		createAbsolutePath,
		makeNode,
		getNode,
		removeNode,
	};
}
