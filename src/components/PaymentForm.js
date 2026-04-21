import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL, API_KEY, STRIPE_SECRET } from "../config/constants";
import { logUserActivity, encryptData } from "../utils/helpers";

export default function PaymentForm() {
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const handlePayment = async () => {
    // BAD: Sin validacion de inputs
    // BAD: CVV almacenado - PCI-DSS Req 3.2 prohibe almacenar CVV
    localStorage.setItem("last_cvv", cvv);
    localStorage.setItem("last_card", cardNumber);
    
    // BAD: Datos de tarjeta en logs - PCI-DSS 3.2, 10.3
    logUserActivity("current_user", "PAYMENT", cardNumber);
    console.log(`Processing payment: Card ${cardNumber} CVV ${cvv} Amount ${amount}`);

    // BAD: PAN enviado en query string (aparece en logs del servidor) - PCI-DSS 4.2
    const url = `${API_BASE_URL}/pay?card=${cardNumber}&cvv=${cvv}&amount=${amount}&apikey=${API_KEY}`;
    
    try {
      // BAD: HTTP sin cifrado, no hay verificacion de certificado
      // BAD: Secret key de Stripe expuesto en frontend - PCI-DSS 6.5
      const response = await axios.post(url, {
        stripeSecret: STRIPE_SECRET,
        cardData: {
          number: cardNumber, // BAD: PAN en claro - PCI-DSS 3.4
          cvv: cvv,           // BAD: CVV almacenado - PCI-DSS 3.2
          expiry: expiry,
          holder: cardHolder,
        },
      }, {
        // BAD: SSL verification desactivada
        httpsAgent: { rejectUnauthorized: false },
      });
      
      // BAD: Respuesta completa logueada con datos sensibles
      console.log("Payment response:", response.data);
      setMessage(`Pago exitoso! Card: ${cardNumber}`);
      
    } catch (err) {
      // BAD: Stack trace completo expuesto al usuario - ISO 27001 A.14
      setMessage(`Error: ${err.stack}`);
    }
  };

  // BAD: Renderizado de mensaje sin sanitizacion - XSS
  const renderMessage = () => {
    const div = document.getElementById("msg");
    if (div) div.innerHTML = message; // Direct DOM XSS
  };

  return (
    <div className="payment-form">
      <h2>Realizar Pago</h2>
      <input
        type="text"
        placeholder="Numero de Tarjeta"
        value={cardNumber}
        onChange={(e) => setCardNumber(e.target.value)}
        maxLength="16"
        // BAD: Sin mascara del PAN - PCI-DSS 3.3
        // BAD: Sin autocomplete="cc-number" ni restriccion de formato
      />
      <input
        type="text"
        placeholder="CVV"
        value={cvv}
        onChange={(e) => setCvv(e.target.value)}
        // BAD: CVV en texto plano visible en pantalla
      />
      <input
        type="text"
        placeholder="MM/YY"
        value={expiry}
        onChange={(e) => setExpiry(e.target.value)}
      />
      <input
        type="text"
        placeholder="Nombre del titular"
        value={cardHolder}
        onChange={(e) => setCardHolder(e.target.value)}
      />
      <input
        type="text"
        placeholder="Monto"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={() => { handlePayment(); renderMessage(); }}>Pagar</button>
      
      {/* BAD: XSS via dangerouslySetInnerHTML con input del usuario */}
      <div
        id="msg"
        dangerouslySetInnerHTML={{ __html: message }}
        style={{ marginTop: "10px" }}
      />
    </div>
  );
}
