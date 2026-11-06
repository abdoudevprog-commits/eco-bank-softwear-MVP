# Abdou Bank — Documentation

## Vue d’ensemble
Abdou Bank est une API Express.js destinée à gérer l’authentification d’utilisateurs et un flux de transfert bancaire basé sur un code OTP.

## Stack technique
- Runtime : Node.js (module ES)
- Framework : Express
- Base de données : MongoDB via mongoose (à connecter via la variable d’environnement)
- Authentification : jsonwebtoken, bcrypt
- Sécurité OTP : crypto

## Prérequis
- Node.js v16+ installé
- MongoDB en cours d’exécution si vous souhaitez utiliser la persistance réelle
- Un fichier .env à la racine du projet

## Installation
1. Installer les dépendances :

```bash
npm install
```

2. Créer un fichier .env à la racine avec au minimum :

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/abdou-bank
JWT_SECRET=your_jwt_secret
```

3. Démarrer le serveur :

```bash
npm start
```

L’application écoute par défaut sur http://localhost:3000. Voir [index.js](index.js).

## Endpoints API

### Santé du serveur
- GET / — retourne un message de disponibilité. Voir [index.js](index.js).

### Authentification
Base : /api/auth — voir [src/auth/authroute.js](src/auth/authroute.js).

- POST /api/auth/register
  - Corps attendu :
    ```json
    {
      "username": "testuser",
      "email": "testuser@example.com",
      "password": "password123"
    }
    ```
  - Crée un utilisateur et hash le mot de passe avec bcrypt.

- POST /api/auth/login
  - Corps attendu :
    ```json
    {
      "username": "testuser",
      "email": "testuser@example.com",
      "password": "password123"
    }
    ```
  - Retourne un JWT si les informations sont valides.

Exemple curl :

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"testuser@example.com","password":"password123"}'
```

### Transfert bancaire

Les routes de transfert se trouvent dans
[`src/User/Client/transfert/src/TransfertRoutes.js`](../src/User/Client/transfert/src/TransfertRoutes.js)
et sont montées sous `/api/client`. Elles nécessitent toutes les deux un JWT dans
l’en-tête `Authorization` :

```text
Authorization: Bearer <token>
```

Le transfert se déroule en deux étapes.

#### 1. Demander un transfert — `POST /api/client/request-transfer`

Corps attendu :

```json
{
  "ReceiverId": "<id-utilisateur-destinataire>",
  "amount": 100
}
```

Cette étape :
- vérifie que le montant est supérieur à zéro ;
- vérifie que l’expéditeur et le destinataire existent ;
- vérifie que l’expéditeur possède un solde suffisant ;
- invalide les anciennes demandes OTP non utilisées de l’expéditeur ;
- crée un OTP valable 10 minutes.

Réponse attendue :

```json
{
  "message": "Code de confirmation envoyé"
}
```

En développement, le code OTP est affiché dans les logs du serveur. Aucun code
OTP ne doit être exposé de cette manière en production.

#### 2. Confirmer le transfert — `POST /api/client/confirm-transfer`

Corps attendu :

```json
{
  "ReceiverId": "<id-utilisateur-destinataire>",
  "amount": 100,
  "code": "123456"
}
```

Cette étape vérifie le code OTP, sa durée de validité et le nombre de tentatives.
Après validation, le transfert est exécuté dans une transaction MongoDB :

1. le montant est retiré du solde de l’expéditeur ;
2. le montant est ajouté au solde du destinataire ;
3. les deux opérations sont validées ensemble.

Si une étape échoue, la transaction est annulée afin d’éviter un débit sans
crédit. Un OTP confirmé est marqué comme utilisé et ne peut pas être réutilisé.

Erreurs principales :

| Situation | Statut |
|---|---:|
| Montant ou code invalide | 400 |
| Expéditeur ou destinataire introuvable | 404 |
| Solde insuffisant | 400 |
| Code OTP expiré ou déjà utilisé | 400 |
| Nombre maximal de tentatives atteint | 429 |
| Token absent, invalide ou expiré | 401 |

La réponse de confirmation contient les utilisateurs mis à jour :

```json
{
  "sender": {},
  "receiver": {}
}
```

La transaction utilisée par la confirmation nécessite une configuration
MongoDB compatible avec les transactions, généralement un replica set, même en
environnement local.

## Structure du projet

Fichiers clés :
- [index.js](index.js) — point d’entrée de l’application et montage des routes
- [package.json](package.json) — dépendances et scripts npm
- [src/auth/authroute.js](src/auth/authroute.js) — routes d’authentification
- [src/auth/authcontrollers.js](src/auth/authcontrollers.js) — contrôleurs d’authentification
- [src/auth/authservice.js](src/auth/authservice.js) — logique métier d’authentification
- [src/User/userRepo.js](src/User/userRepo.js) — modèle utilisateur
- [`src/User/Client/transfert/src/TransfertServices.js`](../src/User/Client/transfert/src/TransfertServices.js) — logique de transfert OTP
- [`src/User/Client/transfert/src/TransfertRoutes.js`](../src/User/Client/transfert/src/TransfertRoutes.js) — routes de transfert protégées par JWT

## Exécution et tests
- Démarrer le serveur : npm start
- Exécuter les tests : npm test
- Utiliser Postman ou curl pour tester manuellement les endpoints

## Prochaines étapes
- Connecter la base MongoDB avec MONGODB_URI dans l’application
- Finaliser la connexion MongoDB et ajouter des tests automatisés du flux JWT/OTP
- Ajouter une validation des entrées et une gestion d’erreurs plus robuste
- Ajouter des tests automatisés et une documentation OpenAPI/Swagger

## Contribution
Les contributions sont les bienvenues. Pour les tests locaux, suivez la section Installation puis démarrez le serveur avec npm start.
