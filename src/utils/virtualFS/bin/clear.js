function clear(argv, state){
    // Hacky way, please improve it later
    return {newState: {history: []}, code: 0, message: "\n".repeat(10)};
}

module.exports = clear
