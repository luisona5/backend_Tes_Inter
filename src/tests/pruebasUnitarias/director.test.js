import request from "supertest";
import app from "../../server.js";
import Estudiante from "../../models/student.js";

describe("FLUJO INDEPENDIENTE DE ESTUDIANTE (API)", () => {

  let tokenEstudiante = "";
  let idEstudiante = "";

  const estudianteData = {
    nombreEstudiante: "Carlos",
    apellidoEstudiante: "Gomez",
    cedulaEstudiante: "0102030405",
    emailEstudiante: "carlos@epn.edu.ec", // 🔑 dominio válido
    telefonoEstudiante: "0991234567",
    direccionEstudiante: "Av Universidad",
    carreraEstudiante: "Desarrollo de Software",
    genero: "Masculino",
    semestre: "Primer Semestre",
    passwordEstudiante: "Pass1234"
  };

  test("1) POST /registro/estudiante crea estudiante independiente", async () => {
    const res = await request(app)
      .post("/registro/estudiante")
      .send(estudianteData);

    expect([200, 201]).toContain(res.statusCode);

    const estudianteBD = await Estudiante.findOne({ emailEstudiante: estudianteData.emailEstudiante });
    expect(estudianteBD).not.toBeNull();
    expect(estudianteBD.confirmEmail).toBe(false);
  });

  test("2) GET /confirmar/estudiante/:token confirma email", async () => {
    const estudianteBD = await Estudiante.findOne({ emailEstudiante: estudianteData.emailEstudiante });
    expect(estudianteBD).not.toBeNull();

    const token = estudianteBD.token;
    const res = await request(app)
      .get(`/confirmar/estudiante/${token}`);

    expect(res.statusCode).toBe(200);

    const actualizado = await Estudiante.findById(estudianteBD._id);
    expect(actualizado.confirmEmail).toBe(true);
  });

  test("3) POST /estudiante/login devuelve token después de confirmar", async () => {
    const resLogin = await request(app)
      .post("/estudiante/login")
      .send({ emailEstudiante: estudianteData.emailEstudiante, passwordEstudiante: estudianteData.passwordEstudiante });

    expect(resLogin.statusCode).toBe(200);
    expect(resLogin.body).toHaveProperty("token");

    tokenEstudiante = resLogin.body.token;
    idEstudiante = resLogin.body._id;
  });

  test("4) GET /estudiante/perfil devuelve datos del estudiante con token", async () => {
    const res = await request(app)
      .get("/estudiante/perfil")
      .set("Authorization", `Bearer ${tokenEstudiante}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.emailEstudiante).toBe(estudianteData.emailEstudiante);
  });

});
