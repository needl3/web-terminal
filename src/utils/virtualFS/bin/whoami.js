function whoami(argv, state) {
    return { newState: {}, code: 0, message: state.user}
}

module.exports = whoami
