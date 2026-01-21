process.env.TZ = 'America/Guayaquil';
import express from 'express';

import app from './server.js'
import  connection  from './database.js';


app.listen(app.get('port'),()=>{
    console.log('✅ Server Ok')
    console.log(`Server ok on http://localhost:${app.get('port')}`);

})  

connection()
