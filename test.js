/*
  INSTRUCTIONS DE TEST DU PROJET
  =============================
  
  1. Démarrer le serveur:
     - npm start (ajouter "start": "node index.js" dans package.json)
     - Ou: node index.js
  
  2. Tester les endpoints en utilisant curl ou Postman:
  
  ✅ TEST 1: Vérifier que le serveur fonctionne
     GET http://localhost:3000/
     
  ✅ TEST 2: Route auth
     GET http://localhost:3000/api/auth/
     
  ✅ TEST 3: Enregistrer un nouvel utilisateur
     POST http://localhost:3000/api/auth/register
     Headers: Content-Type: application/json
     Body: {
       "username": "testuser",
       "password": "password123"
     }
     
  ✅ TEST 4: Se connecter (login)
     POST http://localhost:3000/api/auth/login
     Headers: Content-Type: application/json
     Body: {
       "username": "testuser",
       "password": "password123"
     }
     
  ✅ TEST 5: Essayer de se connecter avec un mauvais mot de passe
     POST http://localhost:3000/api/auth/login
     Body: {
       "username": "testuser",
       "password": "wrongpassword"
     }
     (Devrait retourner une erreur 401)
     
  ✅ TEST 6: Essayer de s'enregistrer avec le même utilisateur
     POST http://localhost:3000/api/auth/register
     Body: {
       "username": "testuser",
       "password": "password123"
     }
     (Devrait retourner une erreur 400)
*/

// Exemple de tests avec fetch (Node.js 18+)
const BASE_URL = "http://localhost:3000";

async function testAPI() {
  try {
    console.log("🧪 Démarrage des tests...\n");

    // Test 1: Health check
    console.log("✅ Test 1: Vérifier le serveur");
    const healthCheck = await fetch(`${BASE_URL}/`);
    const healthData = await healthCheck.json();
    console.log("Response:", healthData, "\n");

    // Test 2: Auth route
    console.log("✅ Test 2: Route auth");
    const authRoute = await fetch(`${BASE_URL}/api/auth/`);
    const authData = await authRoute.json();
    console.log("Response:", authData, "\n");

    // Test 3: Register
    console.log("✅ Test 3: Enregistrement d'un nouvel utilisateur");
    const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "testuser",
        password: "password123",
      }),
    });
    const registerData = await registerRes.json();
    console.log("Response:", registerData, "\n");

    // Test 4: Login
    console.log("✅ Test 4: Connexion (login)");
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "testuser",
        password: "password123",
      }),
    });
    const loginData = await loginRes.json();
    console.log("Response:", loginData, "\n");

    // Test 5: Login avec mauvais mot de passe
    console.log("✅ Test 5: Connexion avec mauvais mot de passe");
    const wrongLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "testuser",
        password: "wrongpassword",
      }),
    });
    const wrongLoginData = await wrongLoginRes.json();
    console.log("Response Status:", wrongLoginRes.status);
    console.log("Response:", wrongLoginData, "\n");

    console.log("✅ Tous les tests sont terminés!");
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  }
}

 testAPI();

export default testAPI;
