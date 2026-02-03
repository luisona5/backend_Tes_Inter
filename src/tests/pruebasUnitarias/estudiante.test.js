import request from 'supertest'
import app from '../../server.js'
import Estudiante from '../../models/student.js'

describe('Registro independiente de estudiante (flujo)', () => {
  const estudianteData = {
    nombreEstudiante: 'Prueba',
    apellidoEstudiante: 'Tester',
    cedulaEstudiante: '0101010101',
    emailEstudiante: 'prueba@epn.edu.ec',
    telefonoEstudiante: '0999999999',
    direccionEstudiante: 'Calle Test',
    carreraEstudiante: 'Desarrollo de Software',
    genero: 'Masculino',
    semestre: 'Primer Semestre',
    passwordEstudiante: 'Pass1234'
  }

  afterEach(async () => {
    await Estudiante.deleteMany({})
  })

  test('1) POST /registro/estudiante crea el estudiante y envía token', async () => {
    const res = await request(app)
      .post('/api/registro/estudiante')
      .send(estudianteData)

    expect([200, 201]).toContain(res.statusCode)

    const estudianteBD = await Estudiante.findOne({ emailEstudiante: estudianteData.emailEstudiante })
    expect(estudianteBD).not.toBeNull()
    expect(estudianteBD.confirmEmail).toBe(false)
    expect(estudianteBD.token).toBeTruthy()
  })

  test('2) GET /confirmar/estudiante/:token confirma cuenta', async () => {
    await request(app).post('/api/registro/estudiante').send(estudianteData)
    const estudianteBD = await Estudiante.findOne({ emailEstudiante: estudianteData.emailEstudiante })
    const token = estudianteBD.token

    const res = await request(app).get(`/api/confirmar/estudiante/${token}`)
    expect(res.statusCode).toBe(200)

    const actualizado = await Estudiante.findById(estudianteBD._id)
    expect(actualizado.confirmEmail).toBe(true)
    expect(actualizado.token).toBeNull()
  })

  test('3) POST /estudiante/login permite iniciar sesión después de confirmar', async () => {
    await request(app).post('/api/registro/estudiante').send(estudianteData)
    const estudianteBD = await Estudiante.findOne({ emailEstudiante: estudianteData.emailEstudiante })
    await request(app).get(`/api/confirmar/estudiante/${estudianteBD.token}`)

    const resLogin = await request(app)
      .post('/api/estudiante/login')
      .send({ email: estudianteData.emailEstudiante, password: estudianteData.passwordEstudiante })

    expect(resLogin.statusCode).toBe(200)
    expect(resLogin.body).toHaveProperty('token')
    expect(resLogin.body).toHaveProperty('_id')
    expect(resLogin.body).toHaveProperty('rol')
  })

  test('4) GET /estudiante/perfil con token devuelve datos del estudiante', async () => {
    await request(app).post('/api/registro/estudiante').send(estudianteData)
    const estudianteBD = await Estudiante.findOne({ emailEstudiante: estudianteData.emailEstudiante })
    await request(app).get(`/api/confirmar/estudiante/${estudianteBD.token}`)

    const login = await request(app)
      .post('/api/estudiante/login')
      .send({ email: estudianteData.emailEstudiante, password: estudianteData.passwordEstudiante })

    const token = login.body.token

    const res = await request(app)
      .get('/api/estudiante/perfil')
      .set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.emailEstudiante).toBe(estudianteData.emailEstudiante)
    expect(res.body.nombreEstudiante).toBe(estudianteData.nombreEstudiante)
  })

  test('5) PUT /actualizarperfilEstudiante/:id actualiza datos del estudiante', async () => {
    await request(app).post('/api/registro/estudiante').send(estudianteData)
    let estudianteBD = await Estudiante.findOne({ emailEstudiante: estudianteData.emailEstudiante })
    await request(app).get(`/api/confirmar/estudiante/${estudianteBD.token}`)

    const login = await request(app)
      .post('/api/estudiante/login')
      .send({ email: estudianteData.emailEstudiante, password: estudianteData.passwordEstudiante })

    const token = login.body.token
    const id = login.body._id

    const res = await request(app)
      .put(`/api/actualizarperfilEstudiante/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nombreEstudiante: 'NombreNuevo', apellidoEstudiante: 'ApellidoNuevo' })

    expect(res.statusCode).toBe(200)
    expect(res.body.nombreEstudiante).toBe('Nombrenuevo')
    expect(res.body.apellidoEstudiante).toBe('Apellidonuevo')
  })

  test('6) PUT /actualizarpasswordEstudiante/:id cambia la contraseña del estudiante', async () => {
    await request(app).post('/api/registro/estudiante').send(estudianteData)
    const estudianteBD = await Estudiante.findOne({ emailEstudiante: estudianteData.emailEstudiante })
    await request(app).get(`/api/confirmar/estudiante/${estudianteBD.token}`)

    const login = await request(app)
      .post('/api/estudiante/login')
      .send({ email: estudianteData.emailEstudiante, password: estudianteData.passwordEstudiante })

    const token = login.body.token
    const id = login.body._id

    const res = await request(app)
      .put(`/api/actualizarpasswordEstudiante/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ passwordactual: estudianteData.passwordEstudiante, passwordnuevo: 'NuevaPassEst1*' })

    expect(res.statusCode).toBe(200)
    expect(res.body.msg).toBe('Password actualizado correctamente')

    const login2 = await request(app)
      .post('/api/estudiante/login')
      .send({ email: estudianteData.emailEstudiante, password: 'NuevaPassEst1*' })

    expect(login2.statusCode).toBe(200)
    expect(login2.body).toHaveProperty('token')
  })

  test('7) Flujo olvidé contraseña: recuperar, comprobar token y crear nuevo password', async () => {
    await request(app).post('/api/registro/estudiante').send(estudianteData)
    let estudianteBD = await Estudiante.findOne({ emailEstudiante: estudianteData.emailEstudiante })
    await request(app).get(`/api/confirmar/estudiante/${estudianteBD.token}`)

    const resRec = await request(app).post('/api/recuperarpasswordEstudiante').send({ email: estudianteData.emailEstudiante })
    expect(resRec.statusCode).toBe(200)

    estudianteBD = await Estudiante.findOne({ emailEstudiante: estudianteData.emailEstudiante })
    expect(estudianteBD.token).toBeTruthy()

    const resCheck = await request(app).get(`/api/recuperarpasswordEstudiante/${estudianteBD.token}`)
    expect(resCheck.statusCode).toBe(200)

    const resNew = await request(app)
      .post(`/api/nuevopasswordEstudiante/${estudianteBD.token}`)
      .send({ password: 'PasswordReset1*', confirmpassword: 'PasswordReset1*' })

    expect(resNew.statusCode).toBe(200)

    const loginRes = await request(app)
      .post('/api/estudiante/login')
      .send({ email: estudianteData.emailEstudiante, password: 'PasswordReset1*' })

    expect(loginRes.statusCode).toBe(200)
    expect(loginRes.body).toHaveProperty('token')
  })
})