# Yoga App (Front)

Application Angular (v19) utilisant **Jest** pour les tests unitaires et d’intégration, **Cypress** pour les tests end-to-end (E2E) et **Istanbul / NYC** pour la couverture de code.

---

## Prérequis

- **Node.js** (version LTS recommandée)
- **npm** (ou **yarn**)
- **Angular CLI** (optionnel, mais recommandé pour le développement)

Installation d’Angular CLI (optionnel) :
```bash
npm install -g @angular/cli
```

---

## Installation

1. Cloner le dépôt :
   ```bash
   git clone [URL_DU_DÉPÔT]
   cd yoga-app
   ```

2. Installer les dépendances :
   ```bash
   npm install
   ```

---

## Scripts disponibles

| Commande                | Description                                      |
|-------------------------|--------------------------------------------------|
| `npm start`             | Démarre le serveur de développement.             |
| `npm run build`         | Construit l’application pour la production.       |
| `npm test`              | Lance les tests unitaires avec Jest.             |
| `npm run test:watch`    | Lance les tests unitaires en mode surveillance.  |
| `npm run e2e`           | Lance les tests end-to-end avec Cypress.         |
| `npm run coverage`      | Génère un rapport de couverture de code.         |

---

## Structure du projet

```
src/
├── app/                  # Composants, services et modules Angular
├── assets/               # Ressources statiques (images, polices, etc.)
├── environments/         # Fichiers de configuration par environnement
└── styles/               # Styles globaux
```

---

## Tests

### Tests unitaires et d’intégration
- **Framework** : Jest
- **Couverture de code** : Istanbul / NYC
- Pour lancer les tests :
  ```bash
  npm test
  ```
- Pour générer un rapport de couverture :
  ```bash
  npm run coverage
  ```

### Tests end-to-end (E2E)
- **Framework** : Cypress
- Pour lancer les tests E2E :
  ```bash
  npm run e2e
  ```

---
