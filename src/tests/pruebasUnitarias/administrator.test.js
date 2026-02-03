import request from 'supertest'
import app from '../../server.js'
import Administrator from '../../models/administrator.js'

describe('Administrador - login y acceso protegido', () => {
  const adminCredentials = {
    email: 'adminlocal@epn.edu.ec',
    password: 'Administrador1*',
  }

  beforeEach(async () => {
    const admin = new Administrator({
      nombre: 'Admin',
      apellido: 'Local',
      cedula: '0101010101',
      telefono: '0999999999',
      email: adminCredentials.email,
      password: 'temp', 
    })
    admin.password = await admin.encryptPassword(adminCredentials.password)
    await admin.save()
  })

  afterEach(async () => {
    await Administrator.deleteMany({})
  })

  test('recuperarPassword genera token, comprobarToken y crear nuevo password', async () => {
    const resRec = await request(app)
      .post('/api/administrador/recuperarpassword')
      .send({ email: adminCredentials.email })

    expect(resRec.statusCode).toBe(200)

    const adminBD = await Administrator.findOne({ email: adminCredentials.email })
    expect(adminBD.token).toBeTruthy()

    
    const resCheck = await request(app).get(`/api/administrador/recuperarpassword/${adminBD.token}`)
    expect(resCheck.statusCode).toBe(200)

   
    const resNew = await request(app)
      .post(`/api/administrador/nuevopassword/${adminBD.token}`)
      .send({ password: 'PasswordNuevo1*', confirmpassword: 'PasswordNuevo1*' })

    expect(resNew.statusCode).toBe(200)

    const adminActualizado = await Administrator.findOne({ email: adminCredentials.email })
    expect(adminActualizado.token).toBeNull()

   
    const loginNew = await request(app)
      .post('/api/administrador/login')
      .send({ email: adminCredentials.email, password: 'PasswordNuevo1*' })

    expect(loginNew.statusCode).toBe(200)
    expect(loginNew.body).toHaveProperty('token')
  })

  test('login con credenciales correctas devuelve token', async () => {
    const res = await request(app)
      .post('/api/administrador/login')
      .send({ email: adminCredentials.email, password: adminCredentials.password })

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('token')
    expect(res.body).toHaveProperty('_id')
    expect(res.body).toHaveProperty('rol')
  })

  test('login con password incorrecto falla con 404', async () => {
    const res = await request(app)
      .post('/api/administrador/login')
      .send({ email: adminCredentials.email, password: 'WrongPass1!' })

    expect(res.statusCode).toBe(404)
    expect(res.body.msg).toBe('Usuario o contraseña es incorrecto')
  })

  test('acceso protegido: ver perfil, actualizar perfil y cambiar password', async () => {
    const login = await request(app)
      .post('/api/administrador/login')
      .send({ email: adminCredentials.email, password: adminCredentials.password })

    expect(login.statusCode).toBe(200)
    const token = login.body.token
    const adminId = login.body._id

    const perfil = await request(app)
      .get('/api/administrador/perfil')
      .set('Authorization', `Bearer ${token}`)

    expect(perfil.statusCode).toBe(200)
    expect(perfil.body.email).toBe(adminCredentials.email)
    expect(perfil.body).not.toHaveProperty('password')

    const resUpdate = await request(app)
      .put(`/api/administrador/actualizarperfil/${adminId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'NuevoNombre', apellido: 'ApellidoNuevo', cedula: '0101010101', telefono: '0987654321', email: adminCredentials.email })

    expect(resUpdate.statusCode).toBe(200)
    expect(resUpdate.body.nombre).toBe('Nuevonombre')
    expect(resUpdate.body.apellido).toBe('Apellidonuevo')
    expect(resUpdate.body.telefono).toBe('0987654321')

    const resPwd = await request(app)
      .put(`/api/administrador/actualizarpassword/${adminId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ passwordactual: adminCredentials.password, passwordnuevo: 'NuevaPassAdmin1*' })

    expect(resPwd.statusCode).toBe(200)
    expect(resPwd.body.msg).toBe('Password actualizado correctamente')

    const login2 = await request(app)
      .post('/api/administrador/login')
      .send({ email: adminCredentials.email, password: 'NuevaPassAdmin1*' })

    expect(login2.statusCode).toBe(200)
    expect(login2.body).toHaveProperty('token')
  })

  test('acceso a perfil sin token falla con 401', async () => {
    const res = await request(app).get('/api/administrador/perfil')
    expect(res.statusCode).toBe(401)
  })

})