


import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

jest.mock("../config/nodemailers.js", () => ({
  sendMailToRegister: jest.fn(async () => "Correo simulado"),
  sendMailToRecoveryPassword: jest.fn(async () => "Correo simulado"),
}));

jest.mock("../helpers/RecoveryPasswordDirector.js", () => ({
  sendMailToRecoveryPasswordDirector: jest.fn(async () => "Correo simulado"),
}));

jest.mock("../helpers/RecoveryPasswordEstudiante.js", () => ({
  sendMailToRecoveryPasswordEstudiante: jest.fn(async () => "Correo simulado"),
}));

jest.mock("../helpers/sendMailStudent.js", () => ({
  sendMailStudent: jest.fn(async () => "Correo simulado"),
}));

jest.mock("../helpers/sendMailToRegisterStudent.js", () => ({
  sendMailToRegisterStudent: jest.fn(async () => "Correo simulado"),
}));



let mongoServer;

beforeAll(async () => {
    process.env.SESSION_SECRET = process.env.SESSION_SECRET || "test_secret";
    process.env.FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri, { dbName: "jest" });
});

afterEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
});
