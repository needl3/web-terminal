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
		permission: "-rw-wx",
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
			// TODO: Check permission before giving access to childrens
			if (
				// owner + +x or others + +x
				(parentDir.properties.owner === user &&
					parentDir.properties.permissions[3] === "x") ||
				(parentDir.properties.permissions[6] === "x" &&
					parentDir.properties.owner !== user)
			)
				parentDir = parentDir.children[i];
			else throw Error("Permission denied", {cause: 'intentional'});
		}
		if (!parentDir) throw Error("Error: No file/directory with that name", {cause: 'intentional'});
		return parentDir;
	}
	function editNode({ cwd, path, file, user, permission }) {
		const absolutePathList = createAbsolutePath(cwd, path, user)
			.split("/")
			.filter((i) => i !== "");
		const parentNodeName = "/" + absolutePathList.join("/");
		const parentNode = getNode(absolutePathList.slice(0, -1), user);
		if (parentNode) {
		}
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
						throw Error("Write permission denied", {cause: 'intentional'});
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
				} else throw Error("Permission denied", {cause: 'intentional'});
			} else {
				throw Error(
					"mkdir: cannot create directory " +
						path +
						": not a directory",
					{cause: 'intentional'}
				);
			}
		}
		return 0;
	}
	function getBinaryString(number) {
		if (number > 7) throw Error("Permission bit can't exceed 7", {cause: 'intentional'});
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
			throw Error("Invalid permission type.", {cause: 'intentional'});
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
		getRoot,
		createAbsolutePath,
		makeNode,
		getNode,
	};
}
