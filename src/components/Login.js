import React, { useState } from "react";
import { ADMIN_USER, ADMIN_PASS, JWT_SECRET } from "../config/constants";
import { hashPassword, logUserActivity } from "../utils/helpers";

// BAD: Credenciales hardcodeadas en frontend - OWASP A07, PCI-DSS 8.3
const HARDCODED_USERS = [
  { username: "admin", password: "password123", role: "admin", ssn: "123-45-6789" },
  { username: "john", password: "john1234", role: "user", cardNumber: "4111111111111111" },
  { username: "test", password: "test", role: "user", cardNumber: "5500005555555556" },
];

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    // BAD: Comparacion en texto plano en el cliente
    const user = HARDCODED_USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      // BAD: Token JWT generado en el cliente con secreto expuesto
      const fakeToken = btoa(`${username}:${JWT_SECRET}:admin=true`);
      
      // BAD: Datos sensibles en localStorage - PCI-DSS 3.4, ISO 27001 A.8.3
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", fakeToken);
      localStorage.setItem("cardNumber", user.cardNumber);
      localStorage.setItem("ssn", user.ssn);
      localStorage.setItem("password_plain", password); // Storing plain password!
      
      // BAD: Log con datos sensibles
      logUserActivity(username, "LOGIN", user.cardNumber);
      
      onLogin(user);
    } else {
      // BAD: Mensaje de error que revela informacion del sistema
      setError(`Usuario ${username} no encontrado o password incorrecto. Usuarios validos: admin, john, test`);
    }
  };

  // BAD: No hay limite de intentos (sin proteccion contra brute force)
  // BAD: No hay CSRF token
  // BAD: Parametros sensibles podrian ir en la URL
  return (
    <div className="login-container">
      <h2>InsecureBank - Login</h2>
      {/* BAD: dangerouslySetInnerHTML con input del usuario - XSS - OWASP A03 */}
      {error && (
        <div dangerouslySetInnerHTML={{ __html: error }} style={{ color: "red" }} />
      )}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        // BAD: Sin autocomplete="off" para campos sensibles
      />
      {/* BAD: password en type="text" visible */}
      <input
        type="text"
        placeholder="Password (visible!)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      
      {/* BAD: Credenciales expuestas en comentario HTML - ISO 27001 A.9 */}
      {/* Default credentials: admin/password123 */}
      {/* DB backup user: dbadmin/Backup2024! */}
    </div>
  );
}
