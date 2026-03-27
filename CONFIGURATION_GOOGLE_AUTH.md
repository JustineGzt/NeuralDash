# 🔧 Configuration de l'authentification Google avec Firebase

## Problème rencontré
Erreur: `CONFIGURATION_NOT_FOUND` - L'authentification Google n'est pas configurée dans Firebase.

## ✅ Solution étape par étape

### 1. Accéder à la console Firebase
Allez sur: https://console.firebase.google.com/

### 2. Sélectionner votre projet
- Projet: **neuraldash-ba1c4**

### 3. Activer l'authentification Google

1. Dans le menu de gauche, cliquez sur **"Authentication"** (🔒 Authentification)
2. Cliquez sur l'onglet **"Sign-in method"** (Méthode de connexion)
3. Dans la liste des fournisseurs, trouvez **"Google"**
4. Cliquez sur **"Google"** pour l'éditer
5. Activez le commutateur **"Activer"**

### 4. Configurer les identifiants OAuth

Dans la fenêtre de configuration Google:

**ID client de l'application Web (SDK)**
```
806965697824-bq5h0qt443s279uhv6oere426q26tb49.apps.googleusercontent.com
```

**Code secret du client de l'application Web (SDK)**
À récupérer dans Google Cloud Console pour le projet concerné. Ne pas le stocker en clair dans le dépôt.

**Email d'assistance du projet**
- Entrez votre email (obligatoire)

### 5. Ajouter les domaines autorisés

Dans la section "Domaines autorisés", assurez-vous que ces domaines sont présents:
- `localhost`
- `neuraldash-ba1c4.firebaseapp.com`
- Votre domaine de production (si applicable)

### 6. Configurer Google Cloud Console (si nécessaire)

Si Firebase vous demande de configurer l'écran de consentement OAuth:

1. Allez sur: https://console.cloud.google.com/
2. Sélectionnez le projet **neuraldash-ba1c4**
3. Menu **"APIs et services"** > **"Écran de consentement OAuth"**
4. Configurez l'écran de consentement:
   - Type d'utilisateur: **Externe**
   - Nom de l'application: **Neural Dash**
   - Email d'assistance: Votre email
   - Logo (optionnel)
   - Domaine autorisé: `neuraldash-ba1c4.firebaseapp.com`

5. Menu **"APIs et services"** > **"Identifiants"**
6. Trouvez l'ID client OAuth 2.0 correspondant
7. Ajoutez les URI de redirection autorisés:
   ```
   http://localhost:5173
   http://localhost:5173/__/auth/handler
   https://neuraldash-ba1c4.firebaseapp.com/__/auth/handler
   ```

### 7. Sauvegarder et tester

1. Cliquez sur **"Enregistrer"** dans Firebase
2. Attendez quelques secondes pour la propagation
3. Actualisez votre application
4. Essayez de vous connecter avec Google

## 🔍 Vérification rapide

Pour vérifier si Google Auth est activé:
1. Console Firebase > Authentication > Sign-in method
2. La ligne "Google" doit afficher **"Activé"** en vert

## 📝 Alternative temporaire

Si vous souhaitez tester immédiatement sans Google:
- Utilisez la connexion par **email/mot de passe**
- Créez un compte avec l'option "S'inscrire"

## ⚠️ Notes importantes

- Les modifications dans Firebase peuvent prendre quelques secondes à se propager
- Assurez-vous d'être connecté avec le bon compte Google (propriétaire du projet)
- L'ID client fourni doit correspondre au projet Firebase neuraldash-ba1c4

## 🆘 En cas de problème persistant

1. Vérifiez que le projet Google Cloud et Firebase sont bien liés
2. Assurez-vous que l'API "Google Identity Toolkit" est activée
3. Vérifiez les quotas de votre projet Google Cloud
4. Essayez de déconnecter/reconnecter de la console Firebase
