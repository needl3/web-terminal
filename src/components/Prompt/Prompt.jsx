import React from "react";
import { useState } from "react";
import "./Prompt.scss";

import FormattedResponse from "../FormattedResponse"

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
                        new Date(new Date().setMilliseconds(historyItem ? historyItem.timeStamp : currentState.timeStamp))
                            .toTimeString()
                            .split(" ")[0]
                    }
                </span>
                ]─[
                <span>{historyItem ? historyItem.cwd : currentState.cwd}</span>]<br />
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
                <p className="response-area">
                    <FormattedResponse message={historyItem.response} />
                </p>
            )}
        </div>
    );
}
