# 🔧 GUIDE RAPIDE - Activation Google Authentication

## ❌ Problème actuel
**Erreur:** `CONFIGURATION_NOT_FOUND` (Code 400)

## ✅ Solution simple (5 minutes)

### Option 1: Activer l'authentification Google (Recommandé)

1. **Ouvrir Firebase Console**
   ```
   https://console.firebase.google.com/
   ```

2. **Sélectionner le projet**
   - Cliquez sur: **neuraldash-ba1c4**

3. **Activer Google Sign-In**
   - Menu gauche → **Authentication** (🔒)
   - Onglet → **Sign-in method**
   - Trouvez **Google** dans la liste
   - Cliquez sur **Google** → Activez le commutateur

4. **Configurer l'ID client** (si demandé)
   ```
   ID Client:
   806965697824-bq5h0qt443s279uhv6oere426q26tb49.apps.googleusercontent.com
   ```

   Renseignez le secret client directement depuis la configuration OAuth de Google Cloud si Firebase le demande.

5. **Ajouter votre email d'assistance**
   - Entrez votre email Gmail

6. **Enregistrer**
   - Cliquez sur **Enregistrer**
   - Attendez 10 secondes

7. **Tester**
   - Actualisez votre application (F5)
   - Cliquez sur "Continuer avec Google"

### Option 2: Utiliser Email/Password (Alternative immédiate)

**Sans configuration nécessaire :**
1. Sur la page de connexion
2. Remplissez email et mot de passe
3. Utilisez l'option "S'inscrire" pour créer un compte
4. Connectez-vous normalement

## 🎨 Améliorations apportées

✅ **Interface améliorée**
- Alerte claire si Google n'est pas configuré
- Instructions détaillées dans l'interface
- Affichage des identifiants OAuth dans l'UI

✅ **Meilleure gestion des erreurs**
- Détection automatique de l'erreur de configuration
- Messages d'erreur plus clairs
- Bouton pour masquer l'alerte

✅ **Documentation**
- Guide complet: `CONFIGURATION_GOOGLE_AUTH.md`
- Guide rapide: `GUIDE_RAPIDE.md` (ce fichier)

## 📸 Capture d'écran console Firebase

Vous devriez voir:
```
Authentication → Sign-in method
┌─────────────────────────────────────┐
│ Fournisseur         État            │
├─────────────────────────────────────┤
│ Google              ✅ Activé        │
│ Email/Password      ✅ Activé        │
└─────────────────────────────────────┘
```

## ❓ En cas de problème

1. **Vérifiez que vous êtes connecté au bon compte Google**
2. **Assurez-vous d'avoir les permissions administrateur sur le projet Firebase**
3. **Essayez de se déconnecter/reconnecter de Firebase Console**
4. **Vérifiez que l'API "Identity Toolkit" est activée dans Google Cloud**

## 💡 Astuce

L'alerte de configuration s'affiche automatiquement dans l'interface quand vous cliquez sur le bouton Google. Elle contient toutes les informations nécessaires directement dans l'application !

---

**Besoin d'aide ?** Consultez `CONFIGURATION_GOOGLE_AUTH.md` pour un guide détaillé.
