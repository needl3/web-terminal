export default function FormattedResponse({ message }) {
    return (
        <>
            {
                message.split("\n").map(item => {
                    return <p>{item}</p>
                })
            }
        </>
    )
}
