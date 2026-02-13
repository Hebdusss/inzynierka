import React from 'react'
import Link from 'next/link'

const LinksContainer = () => {
  return (
    <ul className="menu bg-base-200 w-56 mt-10 rounded-box bg-transparent text-lg font-semibold">
        <li><Link href='/'>Home</Link></li>
        <li><Link href='/workouts'>Workouts & Diets</Link></li>
        <li><Link href='/add-new'>Add new </Link></li>
        <li><Link href='/sets'>Sets</Link></li>
    </ul>
  )
}

export default LinksContainer