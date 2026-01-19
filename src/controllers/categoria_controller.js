import Categoria from '../models/categoria.js'
import mongoose from 'mongoose';

const registrarCategoria = async (req, res) => {
  try {
    const { nombre } = req.body;

   
    if (!req.directorHeader|| !req.directorHeader._id) {
      return res.status(401).json({ msg: "Director no identificado" });
    }

    if (Object.values(req.body).includes("")) {
      return res.status(400).json({ msg: "Debes llenar todos los campos" });
    }

    // Verificar si ya existe
    const datosExistente = await Categoria.findOne({ nombre });
    if (datosExistente) {
      return res.status(400).json({ msg: "La categoría ya se encuentra registrada" });
    }
    
    const nuevaCategoria = new Categoria({
      ...req.body,
      director: req.directorHeader._id, 
    });

    await nuevaCategoria.save();

    return res.status(201).json({ msg: "Categoría registrada exitosamente" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: `❌ Error en el servidor - ${error.message}` });
  }
}





const listarCategoria = async (req,res)=>{
    try {
        const categoria = 
        
        await Categoria.find({ estadoCategoria: true, 
            })
        .select(" -createdAt -updatedAt -__v")
        .populate('director','_id nombreDirector apellidoDirector')

        res.status(200).json(categoria)

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}



const detalleCategoria = async(req,res)=>{

    try {
        const {id} = req.params

        if( !mongoose.Types.ObjectId.isValid(id) ) 
          return res.status(404).json({msg:`No existe la Categoria ${id}`});

        const categoria = await Categoria.findById(id).select("-createdAt -updatedAt -__v")
                                                  .populate('director','_id nombreDirector apellidoDirector')
        res.status(200).json(categoria)
        
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

const eliminarCategoria = async (req,res)=>{

    try {
        const {id} = req.params
        if( !mongoose.Types.ObjectId.isValid(id) ) 
          return res.status(404).json({msg:`No existe la categoria del deporte ${id}`})
        
        await Categoria.findByIdAndUpdate(id,{estadoCategoria:false})
        res.status(200).json({msg:"Categoria eliminado exitosamente"})

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

const actualizarCategoria = async(req,res)=>{
    const {id} = req.params
    if (Object.values(req.body).includes("")) 
      return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})

    if( !mongoose.Types.ObjectId.isValid(id) ) 
      return res.status(404).json({msg:`Lo sentimos, no existe la Categoria ${id}`})
    
    await Categoria.findByIdAndUpdate(id, req.body, { new: true })
    res.status(200).json({msg:"Actualización exitosa de la Categoria"})
}


export{
    registrarCategoria,
    listarCategoria,
    detalleCategoria,
    eliminarCategoria,
    actualizarCategoria
}