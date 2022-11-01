import "./App.scss";
import { useReducer } from "react";

import Prompt from "./components/Prompt";

import exec from "./utils/virtualFS/bin";

const {default: fileSystem}  = require("./utils/fileSystem")
const parseArgs = require("./utils/argsParser")
const uuid = require("uuid")

const visibleHistory = 0;


function execute(state, action) {
	// quotes under quotes, double quotes to close args and escapes are not supported right now
    const parsedCommand = parseArgs(action.command);
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
        cwd: "~/",
        history: [],
		fs: new fileSystem()
    });
    return (
        <div className="terminal-container">
            <ul>
                {currentState.history.slice(-visibleHistory).map((item) => {
                    return (
                        <li key={uuid.v4()}>
                            <Prompt historyItem={item} />
                        </li>
                    );
                })}
                <li key={uuid.v4()}>
                    <Prompt
                        handleUpdate={(command, timeStamp) =>
                            dispatch({ command: command, timeStamp: timeStamp })
                        }
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
