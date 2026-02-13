import { render, screen } from '@testing-library/react'
import UserDetailsInfo from '../app/components/UserDetailsInfo'
import DietsAddNew from '../app/components/Diets/DietsAddNew'
import LinksContainer from '../app/components/LinksContainer'
import { matchPass } from '../app/components/Register/RegisterForm'

test('Check if headline content in teh page is and object', () =>{
      render(<DietsAddNew email={'mail@mail.com'}/>)
      expect(typeof screen.getAllByRole('heading')).toBe('object')
})
 
test('Check if component rerender properly', () => {
   const {rerender} = render(<UserDetailsInfo content='krzychu' value={10}/>)
   expect(screen.getByText('krzychu:')).toBeInTheDocument();

   rerender(<UserDetailsInfo content='patryk' value={8}/>)
   expect(screen.getByText('patryk:')).toBeInTheDocument();
})

test('Check if all links are properly displayed in component', () => {
   render(<LinksContainer/>)

   const homeLink = screen.getByText('Home', { exact: false });
   expect(homeLink).toBeInTheDocument(); 

   const workoutsLink = screen.getByText('Workouts & Diets', { exact: false });
   expect(workoutsLink).toBeInTheDocument();

   const addNewLink = screen.getByText('Add new', { exact: false });
   expect(addNewLink).toBeInTheDocument();

   const setsLink = screen.getByText('Sets', { exact: false });
   expect(setsLink).toBeInTheDocument();
})

test('Check if matching passwords work properly with same strings', () => {
   const res = matchPass('krzysiu','krzysiu')
   expect(res).toBe(true)
})

test('Check if matching passwords work properly with different strings', () => {
   const res = matchPass('krzysiu','krzychu')
   expect(res).not.toBe(true)
})






