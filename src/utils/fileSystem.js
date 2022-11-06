/*
Regarding Permissions:
    - groups not implemneted
    - only use 2 digit numbers for permission (owner, others)
*/

// Register you system binaries here to list in ls
// Blame fs for browser for this inconvenience
const sysBinaries = [
	"ls",
	"clear",
	"whoami",
	"mkdir",
	"echo",
	"cat",
	"cd",
	"rm",
	"rmdir",
	"chmod",
	"chown",
];

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
		permission: "drwx---",
		file: null,
		pseudoRoot: true,
	});

	// Test file
	makeNode({
		user: "root",
		cwd: "/",
		path: "home/Oxsiyo/byRoot.txt",
		permission: "-rw-r-x",
		file: "This is content used to distinguish between file and directory",
	});
	makeNode({
		user: "Oxsiyo",
		cwd: "/",
		path: "home/Oxsiyo/dir",
		file: null,
		permission: "d-wxr-x",
	});
	makeNode({
		user: "Oxsiyo",
		cwd: "/",
		path: "home/Oxsiyo/dir/newdir",
		file: null,
		permission: "d-wx---",
	});
	makeNode({
		user: "Oxsiyo",
		cwd: "/",
		path: "home/Oxsiyo/dir/newdir/temp.txt",
		permission: "-rwxr-x",
		file: "This is content used to permission test",
	});
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
		let parentDir = _root["/"];
		for (let i of absolutePathList) {
			if (
				// owner + +x or others + +x
				(parentDir.properties.owner === user &&
					parentDir.properties.permissions[3] === "x") ||
				(parentDir.properties.permissions[6] === "x" &&
					parentDir.properties.owner !== user) ||
				user === "root"
			)
				parentDir = parentDir.children[i];
			else throw Error("Permission denied", { cause: "intentional" });
		}
		if (!parentDir)
			throw Error("Error: No file/directory with that name", {
				cause: "intentional",
			});
		if (parentDir.properties.permissions[0] === "d") {
			if (
				(parentDir.properties.permissions[3] === "x" &&
					parentDir.properties.owner === user) ||
				(parentDir.properties.permissions[6] === "x" &&
					parentDir.properties.owner !== user) ||
				user === "root"
			)
				// Logic still flawed, donot send whole children tree
				// Just send one node worth of info
				// because external binaries could alter the nodes
				// Create a node setter for this and refactor all caller,callee logic
				return parentDir;
			else if (
				(parentDir.properties.permissions[1] === "r" &&
					parentDir.properties.owner === user) ||
				(parentDir.properties.permissions[4] === "r" &&
					parentDir.properties.owner !== user)
			) {
				const tempDir = {
					properties: parentDir.properties,
					children: {},
				};
				Object.keys(parentDir.children)
					.filter((i) => i !== "parent")
					.forEach((child) => {
						tempDir.children[child] = {
							properties: parentDir.children[child].properties,
						};
					});
				return tempDir;
			} else throw Error("Permission denied.", { cause: "intentional" });
		} else if (parentDir.properties.permissions[0] === "-") {
			if (
				(parentDir.properties.permissions[1] === "r" &&
					parentDir.properties.owner === user) ||
				(parentDir.properties.permissions[4] === "r" &&
					parentDir.properties.owner !== user) ||
				user === "root"
			)
				// Return whole node because there are not children
				return parentDir;
			else throw Error("Permission denied.", { cause: "intentional" });
		}
	}
	function editNode({ cwd, path, user, nodeContent, nodeProperties }) {
		/*
		 API info
		 nodeContent = {
		 	add: bool,
			content: String
			}, 											// add represents concat request
		nodeProperties: {
			owner: String,
			permissions: String 						// permission bits
			}

			Node: Donot initialize all these three fields at once
			If all are initialized only the first will take effect
			Including sub properties of nodeProperties
		 */
		const absolutePathList = createAbsolutePath(cwd, path, user)
			.split("/")
			.filter((i) => i !== "");
		const parentNode = getNode(absolutePathList.slice(0, -1), user);
		const targetChild = parentNode.children[absolutePathList.at(-1)];
		if (!targetChild)
			throw Error("No such file/directory", { cause: "intentional" });
		if (nodeProperties) {
			if (nodeProperties.owner) {
				if (user !== "root")
					throw Error("Cannot change ownership. Permission denied", {
						cause: "intentional",
					});
				parentNode.children[absolutePathList.at(-1)].properties.owner =
					nodeProperties.owner;
			} else if (nodeProperties.permissions) {
				if (user !== targetChild.properties.owner && user !== "root")
					throw Error(
						"Changing permissions. Operation not permitted",
						{ cause: "intentional" }
					);
				parentNode.children[
					absolutePathList.at(-1)
				].properties.permissions =
					targetChild.properties.permissions[0] +
					transformNumericalPermission(nodeProperties.permissions);
			}
		} else if (nodeContent) {
			// Verify permission
			const permission = targetChild.properties.permissions;
			if (
				(user === targetChild.properties.owner &&
					permission[2] === "w") ||
				(user !== targetChild.properties.owner &&
					permission[5] === "w") ||
				user === "root"
			) {
				parentNode.children[absolutePathList.at(-1)].content =
					(nodeContent.add === true
						? targetChild.content + "\n"
						: "") + nodeContent.content;
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
		const parentNode = getNode(absolutePathList.slice(0, -1), user);
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
		const maxDigits = 3;
		const binString = [];
		number.split("").forEach((n) => {
			if (n > 7)
				throw Error("Permission bit's value can't exceed 7", {
					cause: "intentional",
				});
			const binStringTemp = [];
			while (n) {
				binStringTemp.unshift(n % 2);
				n = parseInt(n / 2);
			}
			binString.push(
				...[
					...new Array(maxDigits - binStringTemp.length).fill(0),
					...binStringTemp,
				]
			);
		});
		binString.unshift(
			...new Array(maxDigits * 3 - binString.length).fill(0)
		);
		return binString;
	}
	function transformNumericalPermission(number) {
		try {
			// Remove slice to enable group permissions
			// After you've implemented required checkers

			// Checking if input permission type is number
			if (typeof parseInt(number) !== "number") throw Error();
			const binString = getBinaryString(String(number).slice(0, 2)).slice(3);
			const permString = [];
			for (let i = 0; i < binString.length; i++) {
				switch (i % 3) {
					case 0:
						permString.push(binString[i] ? "r" : "-");
						break;
					case 1:
						permString.push(binString[i] ? "w" : "-");
						break;
					case 2:
						permString.push(binString[i] ? "x" : "-");
						break;
				}
			}
			return permString.join("");
		} catch (e) {
			if (e.cause === "intentional") throw e;
			throw Error("Invalid permission type.", { cause: "intentional" });
		}
	}
	return {
		createAbsolutePath,
		makeNode,
		getNode,
		removeNode,
		editNode,
	};
}
