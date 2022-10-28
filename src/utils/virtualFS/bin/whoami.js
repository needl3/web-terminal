const message =`
                Hello, stranger!
                This is Anish Chapagai.
                I'm currently pursuing Bachelors in Computer Engineering.
                Thank you for learning about me.
                You can reach me at:
                    Facebook: /0xanishchapagai
                    Instagram: /0xanishchapagai
                    Snapchat: @segfaulk
                `

function whoami(argv, state) {
    return { newState: {}, code: 0, message: message }
}

module.exports = whoami