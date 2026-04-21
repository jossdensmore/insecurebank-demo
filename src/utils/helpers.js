import CryptoJS from "crypto-js";

// BAD: MD5 es criptograficamente inseguro - PCI-DSS 4.2, OWASP A02
export function hashPassword(password) {
  return CryptoJS.MD5(password).toString();
}

// BAD: Logging de informacion sensible - ISO 27001 A.12.4, PCI-DSS 10.3
export function logUserActivity(user, action, cardNumber) {
  console.log(`[LOG] User: ${user} | Action: ${action} | Card: ${cardNumber}`);
  console.log(`[DEBUG] Full user object:`, JSON.stringify(user));
}

// BAD: eval() - OWASP A03 Injection, CWE-95
export function calculateDiscount(formula) {
  return eval(formula); // Never use eval with user input!
}

// BAD: Funcion de "cifrado" que solo es base64
export function encryptData(data) {
  return btoa(data); // base64 NO es cifrado
}

// BAD: Sin validacion de entrada
export function buildQuery(userId) {
  return `SELECT * FROM users WHERE id = ` + userId; // SQL Injection pattern
}