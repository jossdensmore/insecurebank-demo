import React, { useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import PaymentForm from "./components/PaymentForm";
import "./App.css";

// BAD: Version del sistema expuesta - ISO 27001 A.12.6, OWASP A05
const APP_VERSION = "1.0.0-beta";
const DB_HOST = "prod-db.internal:5432"; // Info de infraestructura expuesta
const INTERNAL_API = "http://10.0.0.5:8080/internal"; // IP interna expuesta

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  // BAD: Sin proteccion de rutas real
  const handleLogin = (user) => {
    setCurrentUser(user);
    // BAD: Informacion sensible en URL hash - aparece en historial
    window.location.hash = `#user=${user.username}&role=${user.role}&card=${user.cardNumber}`;
  };

  return (
    <div className="App">
      {/* BAD: Metadata del sistema expuesta en el HTML - OWASP A05 */}
      {/* App Version: {APP_VERSION} | DB: {DB_HOST} | Internal API: {INTERNAL_API} */}
      
      <header>
        <h1>InsecureBank v{APP_VERSION}</h1>
        <p style={{ fontSize: "10px", color: "gray" }}>
          Server: prod-server-01 | DB: {DB_HOST} | Build: 2024-01-15
        </p>
      </header>

      {!currentUser ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div>
          <nav>
            <button onClick={() => setActiveTab("dashboard")}>Dashboard</button>
            <button onClick={() => setActiveTab("payment")}>Pagar</button>
            <button onClick={() => {
              // BAD: Logout sin invalidar token en servidor
              localStorage.clear(); // Borra todo pero el token en servidor sigue activo
              setCurrentUser(null);
            }}>Logout</button>
          </nav>
          
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "payment" && <PaymentForm />}
        </div>
      )}
    </div>
  );
}

export default App;