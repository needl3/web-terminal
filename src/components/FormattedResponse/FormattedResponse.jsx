export default function FormattedResponse({ message }) {
    return (
        <>
            {
                message.split("\n").map(item => {
                    return <p key={Date.now()}>{item}</p>
                })
            }
        </>
    )
}
