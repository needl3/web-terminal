function strip(inp){
	let ptr = 0;
	while(inp[ptr] === " " && ptr < inp.length){
		ptr++;
	}
	inp = inp.slice(ptr,);
	ptr = inp.length-1;
	while(inp[ptr] === " " && ptr > 0) ptr--;
	inp = inp.slice(0, ptr+1)
	return inp;
}
function argsParser(command) {
	// Known bug: Cant pass intentional spaces to reflect on args
	const parsed = {};
	const args = [];
	let lptr = 0,
		rptr = 0;
	while (rptr < command.length) {
		if (rptr === lptr) {
		} else if (command[rptr] === " ") {
			if (command[lptr] !== "'"){
				args.push(strip(command.slice(lptr, rptr)));
				lptr = rptr + 1;
			}
		} else if (command[rptr] === "'") {
			if (command[lptr] === "'") {
				args.push(strip(command.slice(lptr+1, rptr)))
				lptr = rptr + 1;
			} else if (command[lptr] === " ") lptr = rptr;
		}
		rptr++;
	}
	if(lptr !== rptr) args.push(strip(command.slice(lptr, rptr)))
	return {bin: args[0], args: args.slice(1)}
}

module.exports = argsParser
