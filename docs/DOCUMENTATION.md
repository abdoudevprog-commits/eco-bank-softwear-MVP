# Eco Bank Software — Documentation

## Vue d’ensemble

Eco Bank Software est un (server side) bancaire développée avec Express.js. il fournit
une base de gestion des utilisateurs, de l’authentification et des opérations
propres aux différents rôles de l’application.

## Stack technique

- Runtime : Node.js (module ES)
- Framework : Express
- Base de données : MongoDB via Mongoose
- Authentification : JSON Web Token et bcrypt
- Sécurité OTP : crypto

## Prérequis

- Node.js v16 ou supérieur
- MongoDB en cours d’exécution
- Un fichier `.env` à la racine du projet

## Installation

```bash
npm install
npm start
```

Variables d’environnement principales :

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/eco-bank-software
JWT_SECRET=your_jwt_secret
```

L’application écoute par défaut sur `http://localhost:3000`. Voir
[index.js](../index.js).

## Modules principaux

### Authentification

Le module d’authentification permet l’inscription et la connexion des
utilisateurs. Il protège l’accès aux fonctionnalités nécessitant une
authentification grâce aux tokens JWT.

Voir [src/auth/](../src/auth/).

### Transfert client

Le module de transfert permet aux clients d’envoyer de l’argent à un autre
utilisateur. Le transfert est confirmé par un code OTP et exécuté de manière
sécurisée dans une transaction MongoDB.

Voir [src/User/Client/transfert/](../src/User/Client/transfert/).

### Gestion du gel des comptes

Le module administrateur permet de gérer le gel des comptes clients selon les
droits de l’administrateur connecté.

Voir [src/User/Admins/freeze/](../src/User/Admins/freeze/).

### Gestion des utilisateurs

Le modèle utilisateur centralise les informations des comptes, notamment le
solde, le rôle et l’état du compte.

Voir [src/User/models/](../src/User/models/).

## Structure du projet

- [index.js](../index.js) — point d’entrée et montage des routes
- [package.json](../package.json) — dépendances et scripts npm
- [src/auth/](../src/auth/) — authentification
- [src/User/Client/transfert/](../src/User/Client/transfert/) — transferts clients
- [src/User/Admins/freeze/](../src/User/Admins/freeze/) — gestion du gel des comptes
- [src/User/models/](../src/User/models/) — modèles utilisateurs

## Exécution et tests

- Démarrer le serveur : `npm start`
- Exécuter les tests : `npm test`
- Utiliser Postman ou curl pour tester manuellement l’API

Les détails de chaque fonction et de chaque module doivent être documentés
dans une documentation individuelle dédiée.

## Contribution

Pour contribuer, installer les dépendances, vérifier les tests, puis démarrer
le serveur avec `npm start`.
