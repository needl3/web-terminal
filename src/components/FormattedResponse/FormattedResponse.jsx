const uuid = require("uuid")
export default function FormattedResponse({ message }) {
    return (
        <>
            {
                message.split("\n").map(item => {
                    return <p key={uuid.v4()}>{item}</p>
                })
            }
        </>
    )
}
