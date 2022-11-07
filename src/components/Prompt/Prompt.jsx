import { useState, lazy, Suspense } from "react";
import("./Prompt.scss");

const FormattedResponse = lazy(() => import("../FormattedResponse"));

export default function Prompt({ handleUpdate, historyItem, currentState }) {
	const [command, setCommand] = useState("");

	function handleKeypress(e) {
		if (e.key === "Enter") {
			handleUpdate(command, currentState.timeStamp);
		}
	}
	return (
		<div className="prompt-item-container">
			<p className="prompt-item">
				┌─[
				<span>
					{
						new Date(
							new Date().setTime(
								historyItem
									? historyItem.timeStamp
									: currentState.timeStamp
							)
						)
							.toTimeString()
							.split(" ")[0]
					}
				</span>
				]─[
				<span>{historyItem ? historyItem.cwd : currentState.cwd}</span>]
				<br />
				└─&#187; $
				<input
					className="command-area"
					type="text"
					onChange={(e) => setCommand(e.target.value)}
					onKeyPress={(e) => handleKeypress(e)}
					readOnly={historyItem !== undefined}
					value={historyItem ? historyItem.command : command}
					autoFocus={historyItem === undefined}
					spellCheck={false}
				/>
			</p>
			{historyItem !== undefined && (
				<div className="response-area">
					<Suspense fallback={<div></div>}>
						<FormattedResponse message={historyItem.response} />
					</Suspense>
				</div>
			)}
		</div>
	);
}
