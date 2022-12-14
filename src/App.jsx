import("./App.scss");
import { useReducer, lazy } from "react";

const Prompt = lazy(() => import("./components/Prompt"));

const exec = require("./utils/virtualFS/bin");
const fileSystem = require("./utils/fileSystem");
const parseArgs = require("./utils/argsParser");
const uuid = require("uuid");

const visibleHistory = 0;
const panicResponse = {
	timeStamp: Date.now(),
	command: "",

	response: `Kernel panic not syncing
				System couldn't initialize it's filesystem
				;..( Please fix me
	`,
	user: "void",
	cwd: "void",
};

function execute(state, action) {
	// quotes under quotes, double quotes to close args and escapes are not supported right now
	const parsedCommand = parseArgs(action.command);
	const response = exec(parsedCommand.bin, parsedCommand.args, {
		user: state.user,
		cwd: state.cwd,
		fs: state.fs,
	});
	const finalState = { ...state, ...response.newState };
	//
	// Hacky way, please improve it later
	//
	if (parsedCommand.bin !== "clear")
		finalState.history.push({
			timeStamp: action.timeStamp,
			command: action.command,
			response: response.message,
			cwd: state.cwd,
			user: state.user,
		});
	return finalState;
}

function App() {
	let fileSys = undefined;
	try {
		fileSys = new fileSystem();
	} catch (e) {
		console.log(e);
		return (
			<div className="terminal-container">
				<ul>
					<li>
						<Prompt historyItem={panicResponse} />
					</li>
				</ul>
			</div>
		);
	}
	const [currentState, dispatch] = useReducer(execute, {
		user: "Oxsiyo",
		cwd: "~/",
		history: [],
		fs: fileSys,
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
