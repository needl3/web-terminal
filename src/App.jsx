import "./App.scss";
import { useReducer } from "react";

import Prompt from "./components/Prompt";

import exec from "./utils/virtualFS/bin";

const fileSystem  = require("./utils/fileSystem")

const visibleHistory = 0;

function parseCommand(command) {
    command = command.split(" ");
    return {
        bin: command[0],
        args: command.slice(1),
    };
}

function execute(state, action) {
    const parsedCommand = parseCommand(action.command);
    const response = exec(parsedCommand.bin, parsedCommand.args, {user: state.user, cwd: state.cwd, fs:state.fs})
    const finalState = {...state, ...response.newState}
    //
    // Hacky way, please improve it later
    //
    if(parsedCommand.bin !== "clear") finalState.history.push({
        timeStamp: action.timeStamp,
        command: action.command,
        response: response.message,
        cwd: state.cwd,
        user: state.user
    });
    return finalState;
}

function App() {
    const [currentState, dispatch] = useReducer(execute, {
        user: "Oxsiyo",
        cwd: "~",
        history: [],
		fs: new fileSystem()
    });
    return (
        <div className="terminal-container">
            <ul>
                {currentState.history.slice(-visibleHistory).map((item) => {
                    return (
                        <li>
                            <Prompt historyItem={item} key={item.timeStamp} />
                        </li>
                    );
                })}
                <li>
                    <Prompt
                        handleUpdate={(command, timeStamp) =>
                            dispatch({ command: command, timeStamp: timeStamp })
                        }
                        key={Date.now()}
                        currentState={{
                            ...currentState,
                            timeStamp: Date.now(),
                        }}
                    />
                </li>
            </ul>
        </div>
    );
}

export default App;
