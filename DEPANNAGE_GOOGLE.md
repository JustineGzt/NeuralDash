# 🚨 DÉPANNAGE - Connexion Google ne fonctionne toujours pas

## Problème
Vous avez activé Google dans Firebase mais le bouton ne fonctionne toujours pas.

## ✅ Vérifications essentielles

### 1. Vérifier Firebase Console (CRITIQUE)

#### A. Authentification Google activée
1. Ouvrez: https://console.firebase.google.com/project/neuraldash-ba1c4/authentication/providers
2. **Vérifiez que "Google" affiche "Activé"** (texte vert)
3. Si ce n'est pas le cas, cliquez sur Google et activez-le

#### B. Configuration de l'ID client Web
1. Cliquez sur **Google** dans la liste
2. Vous devriez voir une section "Configuration du SDK Web"
3. **IMPORTANT**: Vérifiez ces champs :

   ```
   ✅ ID client de l'application Web (SDK)
   806965697824-bq5h0qt443s279uhv6oere426q26tb49.apps.googleusercontent.com
   ```

   Le secret client doit etre verifie dans Google Cloud Console, mais ne doit pas etre ajoute au depot.

4. **Email d'assistance du projet**: Doit être rempli (votre email Gmail)
5. Cliquez sur **Enregistrer**

---

### 2. Google Cloud Console - URI de redirection (TRÈS IMPORTANT ⚠️)

C'est **LA CAUSE PRINCIPALE** des problèmes de connexion Google !

#### A. Accéder à Google Cloud Console
1. Ouvrez: https://console.cloud.google.com/
2. **Sélectionnez le projet**: neuraldash-ba1c4 (en haut à gauche)

#### B. Configurer les URI de redirection OAuth
1. Menu ☰ → **APIs et services** → **Identifiants**
2. Sous "ID client OAuth 2.0", trouvez votre client :
   ```
   806965697824-bq5h0qt443s279uhv6oere426q26tb49.apps.googleusercontent.com
   ```
3. **Cliquez sur l'icône ✏️ (modifier)** à droite

4. **Section "URI de redirection autorisés"** - Ajoutez ces URI :
   ```
   http://localhost
   http://localhost:5173
   http://localhost:5173/__/auth/handler
   https://neuraldash-ba1c4.firebaseapp.com
   https://neuraldash-ba1c4.firebaseapp.com/__/auth/handler
   https://neuraldash-ba1c4.web.app
   https://neuraldash-ba1c4.web.app/__/auth/handler
   ```

5. **Section "Origines JavaScript autorisées"** - Ajoutez :
   ```
   http://localhost:5173
   http://localhost
   https://neuraldash-ba1c4.firebaseapp.com
   https://neuraldash-ba1c4.web.app
   ```

6. **Cliquez sur "ENREGISTRER"** en bas

#### C. Attendre la propagation
⏱️ **IMPORTANT**: Attendez **5 à 10 minutes** après avoir sauvegardé pour que les changements se propagent.

---

### 3. Vérifier l'écran de consentement OAuth

1. Dans Google Cloud Console
2. Menu → **APIs et services** → **Écran de consentement OAuth**
3. Vérifiez :
   - ✅ **État de publication**: "En test" ou "En production"
   - ✅ **Nom de l'application**: Rempli (ex: "Neural Dash")
   - ✅ **Email d'assistance utilisateur**: Votre email
   - ✅ **Domaines autorisés**: Ajoutez `firebaseapp.com` si absent

4. Sauvegardez si vous avez modifié

---

### 4. Activer les APIs requises

1. Google Cloud Console → **APIs et services** → **Bibliothèque**
2. Recherchez et **ACTIVEZ** ces APIs :
   - ✅ **Identity Toolkit API**
   - ✅ **Google+ API** (optionnelle mais recommandée)

---

### 5. Vérifier les domaines autorisés dans Firebase

1. Firebase Console → **Authentication** → **Settings** (onglet)
2. Section "Domaines autorisés"
3. Vérifiez que ces domaines sont présents :
   ```
   localhost
   neuraldash-ba1c4.firebaseapp.com
   neuraldash-ba1c4.web.app
   ```
4. Ajoutez `localhost` s'il est manquant

---

## 🔍 Diagnostic avec l'outil intégré

Sur la page de connexion, vous avez maintenant un bouton **"🔧 Debug Firebase"** en bas à droite.

1. Cliquez dessus
2. Vérifiez les informations affichées
3. Copiez les informations pour diagnostic

---

## 🧪 Test étape par étape

### Test 1: Vérifier la popup
```javascript
// Ouvrez la console du navigateur (F12)
// Exécutez cette commande :
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from './lib/firebase';

const provider = new GoogleAuthProvider();
signInWithPopup(auth, provider)
  .then((result) => console.log('✅ Succès:', result))
  .catch((error) => console.error('❌ Erreur:', error));
```

### Test 2: Vérifier les erreurs dans la console
1. Ouvrez la console du navigateur (F12)
2. Onglet **Console**
3. Cliquez sur le bouton "Continuer avec Google"
4. **Copiez toutes les erreurs affichées** (très important!)

---

## ❌ Erreurs courantes et solutions

### Erreur: "redirect_uri_mismatch"
**Cause**: Les URI de redirection ne sont pas configurés
**Solution**: Suivez l'étape 2.B ci-dessus (URI de redirection)

### Erreur: "popup_closed_by_user"
**Cause**: Vous avez fermé la popup
**Solution**: Normale, réessayez

### Erreur: "popup_blocked_by_browser"
**Cause**: Votre navigateur bloque les popups
**Solution**: 
1. Cliquez sur l'icône de blocage de popup dans la barre d'adresse
2. Autorisez les popups pour localhost

### Erreur: "auth/unauthorized-domain"
**Cause**: Le domaine n'est pas autorisé dans Firebase
**Solution**: Ajoutez `localhost` dans Firebase → Authentication → Settings → Domaines autorisés

### Erreur: "idpiframe_initialization_failed"
**Cause**: Cookies tiers bloqués
**Solution**: 
1. Chrome: Settings → Privacy → Cookies → "Allow all cookies" (temporairement)
2. Ou ajoutez une exception pour `accounts.google.com` et `firebaseapp.com`

---

## 🔄 Checklist complète (cochez chaque étape)

- [ ] Google activé dans Firebase Authentication
- [ ] ID client OAuth configuré dans Firebase
- [ ] Email d'assistance rempli dans Firebase
- [ ] URI de redirection ajoutés dans Google Cloud Console
- [ ] Origines JavaScript ajoutées dans Google Cloud Console
- [ ] Écran de consentement OAuth configuré
- [ ] Identity Toolkit API activée
- [ ] Domaines autorisés dans Firebase (localhost inclus)
- [ ] Attendu 5-10 minutes après les modifications
- [ ] Vidé le cache du navigateur (Ctrl+Shift+Del)
- [ ] Testé dans une fenêtre privée/incognito

---

## 🆘 Toujours bloqué ?

### Collectez ces informations :

1. **Erreur exacte de la console** (F12 → Console)
2. **Capture d'écran de Firebase** → Authentication → Sign-in method
3. **Capture d'écran Google Cloud** → Identifiants OAuth
4. **Navigateur utilisé** (Chrome, Firefox, etc.)
5. **URL de votre application** (probablement http://localhost:5173)

### Solutions alternatives :

1. **Créez un nouvel ID client OAuth** dans Google Cloud Console
2. **Utilisez la connexion Email/Password** temporairement
3. **Testez dans un autre navigateur** (Chrome, Firefox, Edge)
4. **Testez en mode navigation privée**

---

## 📝 Note importante

La plupart des problèmes viennent de **l'étape 2 (URI de redirection)**. C'est l'étape la plus critique et la plus souvent oubliée !

**Rappelez-vous** : Les modifications dans Google Cloud peuvent prendre **5 à 10 minutes** à se propager. Soyez patient !
