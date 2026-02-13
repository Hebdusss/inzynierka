import React from 'react'

interface Props {
    title: string
}

const FormsHeader = ({title}: Props) => {
  return (
    <div>
        <h2>Add new {title}</h2>
    </div>
  )
}

export default FormsHeader