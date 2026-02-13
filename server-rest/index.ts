import express, {Express} from 'express'
import dotenv from 'dotenv'
import workoutRoutes from './routes/workouts'
import dietsRoutes from './routes/diets'
import setsRoutes from './routes/sets'
import cors from 'cors'


dotenv.config()
const app: Express = express();
const port = process.env.PORT || 8000

const corsOptions = {
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
}
app.use(cors(corsOptions))

app.use(express.json())

app.use('/api/workouts', workoutRoutes)
app.use('/api/diets', dietsRoutes)
app.use('/api/sets', setsRoutes)


app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
})


