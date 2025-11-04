import express from 'express' // facilita crear servidores web, APIs, manejar rutas, middlewares, etc.
import dotenv from 'dotenv' //  sirve para cargar variables de entorno desde un archivo .env en process.env. 
import cors from 'cors'  // Este middleware permite configurar y manejar el acceso entre dominios diferentes en las solicitudes HTTP.



 const app = express()

 dotenv.config() // llamo y accedo a mis configuraciones sensibles o variables 



// No uses app.use(express()) — eso devuelve una app, no un middleware.
  app.use(express.json()) // para que el servidor entienda json, es dar la informacion de frontend al backend

 app.use(cors())



 // mis avriables globalesj
 app.set('port',process.env.PORT || 3000)




 // para mis rutas
 app.get('/', (req,res)=>res.send('server on'))
  
 //-------> REQ = peticion del cliente
 //-------> RES = es la respuesta que le va a dar al cliente

   ;





 export  default app