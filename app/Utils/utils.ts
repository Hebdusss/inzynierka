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

export const editWorkout = async (id: number, data: any) => {
    const request = await fetch(`/api/workouts/${id}`, {
        method: 'PUT',
        headers: {
            "Accept": "application/json",
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(data)
    })
    return request.json()
}

export const deleteDiet = async (id: number) => {
    const request = await fetch(`/api/diets/${id}`, {
        method: 'DELETE'
    })
    return request.json()
}

export const editDiet = async (id: number, data: any) => {
    const request = await fetch(`/api/diets/${id}`, {
        method: 'PUT',
        headers: {
            "Accept": "application/json",
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(data)
    })
    return request.json()
}

export const deleteSet = async (id: number) => {
    const request = await fetch(`/api/sets/${id}`, {
        method: 'DELETE'
    })
    return request.json()
}

export const postSchedule = async (data: { email: string; setId: number; date: string }) => {
    const request = await fetch(`/api/schedule`, {
        method: 'POST',
        headers: {
            "Accept": "application/json",
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(data)
    })
    return request.json()
}

export const deleteSchedule = async (id: number) => {
    const request = await fetch(`/api/schedule/${id}`, {
        method: 'DELETE'
    })
    return request.json()
}

export const updateScheduleDate = async (id: number, date: string) => {
    const request = await fetch(`/api/schedule/${id}`, {
        method: 'PATCH',
        headers: {
            "Accept": "application/json",
            "Content-Type": 'application/json'
        },
        body: JSON.stringify({ date })
    })
    return request.json()
}

export const toggleScheduleCompleted = async (id: number, completed: boolean) => {
    const request = await fetch(`/api/schedule/${id}`, {
        method: 'PATCH',
        headers: {
            "Accept": "application/json",
            "Content-Type": 'application/json'
        },
        body: JSON.stringify({ completed })
    })
    return request.json()
}