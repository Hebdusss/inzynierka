// Client-side API helpers (mutations only - reads are done server-side via db-queries.ts)

export const postWorkout = async (data: any) => {
    const request = await fetch(`/api/workouts`, {
        method: 'POST',
        headers: {
            "Accept": "application/json",
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(data)
    })
    return request.json()
}

export const postDiet = async (data: any) => {
    const request = await fetch(`/api/diets`, {
        method: 'POST',
        headers: {
            "Accept": "application/json",
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(data)
    })
    return request.json()
}

export const postSet = async (data: any) => {
    const request = await fetch(`/api/sets`, {
        method: 'POST',
        headers: {
            "Accept": "application/json",
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(data)
    })
    return request.json()
}

export const deleteWorkout = async (id: number) => {
    const request = await fetch(`/api/workouts/${id}`, {
        method: 'DELETE'
    })
    return request.json()
}

export const deleteDiet = async (id: number) => {
    const request = await fetch(`/api/diets/${id}`, {
        method: 'DELETE'
    })
    return request.json()
}

export const deleteSet = async (id: number) => {
    const request = await fetch(`/api/sets/${id}`, {
        method: 'DELETE'
    })
    return request.json()
}