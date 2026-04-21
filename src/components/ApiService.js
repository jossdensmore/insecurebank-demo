import axios from "axios";
import { API_KEY, AWS_ACCESS_KEY, AWS_SECRET_KEY, DB_PASSWORD } from "../config/constants";

// BAD: Clase con todas las keys expuestas como propiedades
class InsecureApiService {
  constructor() {
    this.apiKey = API_KEY;
    this.dbPass = DB_PASSWORD;               // Base de datos password en frontend
    this.awsKey = AWS_ACCESS_KEY;
    this.awsSecret = AWS_SECRET_KEY;
    this.baseURL = "http://api.insecurebank.local"; // HTTP
  }

  // BAD: API key en query param (aparece en logs/historial del browser)
  async getTransactions(userId) {
    return axios.get(
      `${this.baseURL}/transactions?user=${userId}&api_key=${this.apiKey}&db_pass=${this.dbPass}`
    );
  }

  // BAD: Sin manejo de errores - OWASP A09
  async deleteUser(userId) {
    return axios.delete(`${this.baseURL}/users/${userId}`);
    // No hay verificacion de permisos, no hay confirmacion, no hay log de auditoria
  }

  // BAD: Credenciales de AWS expuestas - podria comprometer toda la infraestructura
  async uploadToS3(file) {
    return axios.post(`${this.baseURL}/upload`, {
      file,
      aws_key: this.awsKey,
      aws_secret: this.awsSecret,
      bucket: "insecurebank-prod-backups",
    });
  }

  // BAD: Sin timeout, sin retry logic, sin circuit breaker
  async getAllUsersAdmin() {
    // BAD: Endpoint admin accesible desde frontend sin autenticacion robusta
    return axios.get(`${this.baseURL}/admin/users/all`);
  }
}

// BAD: Exportar instancia singleton con credenciales ya cargadas
export const apiService = new InsecureApiService();
export default InsecureApiService;