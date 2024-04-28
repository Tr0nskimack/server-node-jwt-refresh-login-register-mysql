import express from "express"
import morgan from 'morgan'
import authRoutes from './routes/auth.routes.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'


const app = express()
//esta sentencia es para que entienda json si no se coloca sale undefined
app.use(express.json())
//aqui se usa cookier parser para leer las cookies, si no se instala y se usa saldra undefined es como express json
app.use(cookieParser())

//cors permite peticiones y se puede especificar de que puerto solo recibira peticiones en este caso del frontend por el puerto 5173
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["POST", "GET"],
    //para trabajar con las cookies en las cabeceras de las paginas, sesion de usuarios
    credentials: true
}))







//middlewares
//hay q arrancar morgan para que empieze a monitorear el sistema
app.use(morgan('dev'))


//routes
app.use("/", authRoutes)






export default app
