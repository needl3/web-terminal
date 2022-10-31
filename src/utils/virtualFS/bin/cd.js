function cd(argv, state){
	const finalState = {newState: {}, code: 0, message: ""}
	let root = state.fs.getRoot()["/"]
	if(argv[0] === "-h" || argv[0] === "--help"){
		finalState.message = `
							Change directory
							Usage: cd <path>
							`
	}else{
		const path= state.fs.createAbsolutePath(state.cwd, argv[0], state.user).split("/").filter(i=>i!=="")
		for(let i=0;i<path.length;i++){
			try{
				root = root.children[path[i]]
			}catch(e){
				console.log(e)
				finalState.message = "No such directory exists"
				finalState.code = 1
				break
			}
		}
		if(finalState.code === 0){
			try{
			finalState.newState.cwd = root.children.parent.replace("/home/"+state.user, "~")
			}catch(e){
				console.log(e)
				finalState.message = "No such directory exists"
				finalState.code = 1
			}
		}
	}
	return finalState;
}

module.exports = cd
