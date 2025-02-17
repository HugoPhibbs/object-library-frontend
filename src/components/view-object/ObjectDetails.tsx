function ObjectDetails({ object }: { object: any }) {
    return (
        <div>
            <h1>{object.name}</h1>
            <p>{object.description}</p>
            <p>{object.price}</p>
        </div>
    )
}