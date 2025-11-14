import express from 'express' // facilita crear servidores web, APIs, manejar rutas, middlewares, etc.
import dotenv from 'dotenv' //  sirve para cargar variables de entorno desde un archivo .env en process.env. 
import cors from 'cors'  // Este middleware permite configurar y manejar el acceso entre dominios diferentes en las solicitudes HTTP.
import routerAdmin from './routers/Administrator_routes.js'
import routerDirector from './routers/Director_routes.js'


 const app = express()

 dotenv.config() // llamo y accedo a mis configuraciones sensibles o variables 



// No uses app.use(express()) — eso devuelve una app, no un middleware.
 app.use(express.json()) // para que el servidor entienda json, es dar la informacion de frontend al backend

 app.use(cors())



 // mis avriables globalesj
 app.set('port',process.env.PORT || 3000)




 // para mis rutas del servidor
app.get('/',(req,res)=>{
    res.send('Server on')
})


app.use('/api', routerAdmin)

app.use('/api',routerDirector)
  
 
 app.use((req,res)=>{res.status(404).send('Endpoint no encontrado')})






 export  default app