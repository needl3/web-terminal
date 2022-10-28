function ls(argv, state) {
    const helpMessage = `Files and directory lister:
                        Usage:  ls <path>`;
    const returnState = { newState: {}, code: 0, message: ""};
    try {
        if(!argv.length) argv.push(".")
        if (argv[0] === "--help" || argv[0] === "-h") {
            returnState.message = helpMessage
        } else {
            if(argv[0] !== ".") throw Error();
            // Too lazy to implement true binary like features
            returnState.message = `bin sys boot home root`
        }
    } catch (e) {
        returnState.message = `Invalid use!
                    ${helpMessage}`
    }
    return returnState
}

module.exports = ls
