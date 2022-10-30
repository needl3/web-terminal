/*
    Every binary should:
        - Take bin, argv, state
        - Always return {newState: Object, code: Int, message: String}
*/

export default function exec(bin, argv, state){
    let finalResponse= {
        code: 1,
        message: "",
    };
    try {
        finalResponse = require(`./${bin}`)(argv, state);
    } catch (e) {
		console.log(e)
        finalResponse = { code: 1, message: bin+": Command not found" };
    }
    return finalResponse;
}
