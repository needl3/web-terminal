/*
    Every binary should:
        - Take bin, argv, state
        - Always return {newState: Object, code: Int, message: String}
*/

function exec(bin, argv, state) {
	try{
		return require(`./${bin}`)(argv,state)
	}catch(e){
		console.log(e)
		return {
			code: 1,
			message: bin + ": Command not found",
			newState: {}
		}
	}
}
module.exports = exec;
