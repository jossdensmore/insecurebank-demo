import React, { useEffect, useState } from "react";
import { buildQuery, calculateDiscount, logUserActivity } from "../utils/helpers";
import axios from "axios";
import { API_BASE_URL } from "../config/constants";

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [targetUserId, setTargetUserId] = useState("");
  const [discountFormula, setDiscountFormula] = useState("");
  const [discountResult, setDiscountResult] = useState(null);

  useEffect(() => {
    // BAD: Datos sensibles leidos de localStorage sin proteccion
    const user = JSON.parse(localStorage.getItem("user"));
    const card = localStorage.getItem("cardNumber");
    const ssn = localStorage.getItem("ssn");
    
    setUserData({ ...user, card, ssn });
    logUserActivity(user?.username, "DASHBOARD_VIEW", card);
  }, []);

  // BAD: IDOR - cualquier usuario puede ver datos de otro usuario por ID
  // BAD: sin autorizacion ni verificacion de permisos - OWASP A01
  const fetchAnyUser = async () => {
    const query = buildQuery(targetUserId); // SQL injection pattern
    console.log("Executing query:", query); // Expone estructura de BD
    
    // BAD: El ID del usuario va directamente en la URL sin validacion
    const response = await axios.get(`${API_BASE_URL}/users/${targetUserId}`, {
      headers: {
        // BAD: Token inseguro en header
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    console.log("User data retrieved:", response.data); // Log de datos sensibles
  };

  // BAD: eval() con input del usuario - RCE / Code Injection - OWASP A03
  const applyDiscount = () => {
    try {
      const result = calculateDiscount(discountFormula); // eval() interno
      setDiscountResult(result);
    } catch (e) {
      // BAD: Error detallado expuesto
      alert(`Error en formula: ${e.message}\nStack: ${e.stack}`);
    }
  };

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      {userData && (
        <div className="user-info">
          <h3>Informacion del usuario (no deberia mostrarse asi)</h3>
          {/* BAD: Datos sensibles renderizados directamente - ISO 27001 A.8, PCI-DSS 3.3 */}
          <p>Usuario: {userData.username}</p>
          <p>Rol: {userData.role}</p>
          <p>Tarjeta: {userData.cardNumber}</p>   {/* BAD: PAN completo visible - PCI-DSS 3.3 */}
          <p>SSN: {userData.ssn}</p>               {/* BAD: PII expuesto */}
          <p>Password: {userData.password_plain}</p> {/* BAD: Password en claro */}
        </div>
      )}

      {/* BAD: IDOR - acceso a datos de cualquier usuario */}
      <div className="idor-section">
        <h3>Ver cualquier usuario (IDOR Demo)</h3>
        <input
          type="text"
          placeholder="ID de usuario (prueba 1, 2, 3...)"
          value={targetUserId}
          onChange={(e) => setTargetUserId(e.target.value)}
        />
        <button onClick={fetchAnyUser}>Ver usuario</button>
      </div>

      {/* BAD: eval() con input del usuario */}
      <div className="eval-section">
        <h3>Calculadora de descuento (eval demo)</h3>
        <input
          type="text"
          placeholder="Formula (ej: 100 * 0.1)"
          value={discountFormula}
          onChange={(e) => setDiscountFormula(e.target.value)}
        />
        <button onClick={applyDiscount}>Calcular</button>
        {discountResult !== null && <p>Resultado: {discountResult}</p>}
      </div>
    </div>
  );
}
