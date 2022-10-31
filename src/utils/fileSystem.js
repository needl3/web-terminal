/*
Regarding Permissions:
    - groups not implemneted
    - only use 2 digit numbers for permission
*/

// Register you system binaries here to list in ls
// Blame fs for browser for this inconvenience
const sysBinaries = ["ls", "clear", "whoami", "mkdir", "echo", "cat"] 

class FileSystem {
	constructor() {
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
		this.getRoot = () => _root;
		this.setRoot = (newRoot) => (_root = newRoot);

		// Initialize pre-shipped binaries
		this.makeNode({
			user: "root",
			cwd: "/",
			path: "bin",
			dir: true,
		});
		this.makeNode({
			user: "root",
			cwd: "/",
			path: "home",
			dir: true,
		});
		this.makeNode({
			user: "root",
			cwd: "/",
			path: "home/Oxsiyo",
			dir: true,
		});
		sysBinaries.forEach((bin) => {
			this.makeNode({
				user: "root",
				cwd: "/bin/",
				path: bin,
				dir: false,
			});
		});
	}
	createAbsolutePath(cwd, path, user) {
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

	makeNode({ cwd, path, dir, user}) {
		//
		// No permission check implemented
		//
		try {
			const _r = this.getRoot()["/"];
			const absolutePath = this.createAbsolutePath(cwd, path, user)
				.split("/")
				.filter((i) => i !== "");
			let parentNode = _r;
			for (let i = 0; i < absolutePath.length; i++) {
				let node = absolutePath[i];
				if (Object.keys(parentNode.children).includes(node)) {
					parentNode = parentNode.children[`${node}`];
				} else {
					if (i === absolutePath.length - 1) {
						if (!dir) {
							parentNode.children[`${node}`] = {
								properties: {
									owner: user,
									permissions: "-rw-r--",
								},
								content: "",
							};
						} else {
							parentNode.children[`${node}`] = {
								properties: {
									owner: user,
									permissions: "drwxr--",
								},
								children: {
									parent: "/" + absolutePath.join("/") + "/",
								},
							};
						}
						return 0;
					} else {
						throw Error(
							`Invalid path. ${node} Directory doesn't exist`
						);
					}
				}
			}
		} catch (e) {
			console.log(e);
			return 1;
		}
	}
	getBinaryString(number) {
		if (number > 7) throw Error("Permission bit can't exceed 7");
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
	transformNumericalPermission(number) {
		try {
			// Remove slice to enable group permissions
			return getBinaryString(String(number).slice(0, 2));
		} catch (e) {
			throw Error("Invalid permission type.");
		}
	}

	permissionParser(permission) {
		try {
			transformNumericalPermission(permission);
		} catch (e) {
			console.log(e);
		}
	}
}

module.exports = FileSystem;
