import React from 'react'

interface Props {
    id: number,
    name: string,
    grams: number,
    kcal: number,
    proteins: number,
    fats: number,
    carbohydrate: number,
    vitamins: string,
    deleteDiet: (id: number) => void
}

const DietCard = ({id,name,grams,kcal,proteins,fats,carbohydrate,vitamins, deleteDiet}: Props) => {
  return (
        <div className='border-b-2 p-3'>
        <h4>{name}</h4>
        <div className='flex justify-between'>
            <div className='flex text-s  pr-10'>
                <ul className="list-none">
                    <li>Grams: <span className='font-semibold'>{grams}</span></li>
                    <li>Kcal: <span className='font-semibold'>{kcal}</span></li>
                    <li>Proteins: <span className='font-semibold'>{proteins}</span></li>
                </ul>
                <ul className='list-none ml-5'>
                    <li>Fats: <span className='font-semibold'>{fats}</span></li>
                    <li>Carbohydrate: <span className='font-semibold'>{carbohydrate}</span></li>
                    <li>Vitamins: <span className='font-semibold'>{vitamins}</span></li>
                </ul>
            </div>
            <div className='flex justify-center content-center h-full'>
                <button className="btn rounded-3xl" 
                onClick={() => deleteDiet(id)}>Delete</button>
            </div>
        </div>
    </div>
  )
}

export default DietCard