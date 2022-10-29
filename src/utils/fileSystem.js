/*
Regarding Permissions:
    - groups not implemneted
    - only use 2 digit numbers for permission
*/

// Register you system binaries here to list in ls
// Blame fs for browser for this inconvenience
const sysBinaries = ["ls", "clear", "whoami"];

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
	createAbsolutePath(cwd, path) {
		if (path[0] === "/") return path;
		else {
			if (path[0] === "~")
				return "/home/Oxsiyo/" + path.split("/").slice(1);

			cwd = cwd.split("/").slice(0, -1);
			path = path.split("/");

			path.forEach((p) => {
				if (p === ".." && cwd.length > 1) cwd.pop();
				else if (p !== "" && p !== ".." && p !== ".") cwd.push(p);
			});

			if (cwd[-1] !== "") cwd.push("");

			return cwd.join("/");
		}
	}
	makeNode({ cwd, path, dir, user, content }) {
		//
		// No permission check implemented
		//
		try {
			const _r = this.getRoot()["/"];
			const absolutePath = this.createAbsolutePath(cwd, path)
				.split("/")
				.filter((i) => i !== "");
			let parentNode = _r;
			absolutePath.forEach((node) => {
				if (Object.keys(parentNode.children).includes(node)) {
					parentNode = parentNode.children[`${node}`];
				} else {
					if (node === absolutePath.at(-1)) {
						if (!dir) {
							parentNode.children[`${node}`] = {
								properties: {
									owner: user,
									permissions: "-rw-r--",
								},
								content: content,
							};
						} else {
							parentNode.children[`${node}`] = {
								properties: {
									owner: user,
									permissions: "drwxr--",
								},
								children: {
									parent: "/"+absolutePath.join("/")+"/",
								},
							};
						}
					} else {
						throw Error(
							`Invalid path. ${node} Directory doesn't exist`
						);
					}
				}
			});
		} catch (e) {
			console.log(e);
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
