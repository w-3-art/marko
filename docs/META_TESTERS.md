# Comment ajouter des testeurs à l'app Meta Marko

L'application Marko est actuellement en **mode développement** sur Meta. Cela signifie que seuls les testeurs approuvés peuvent utiliser l'intégration Instagram/Facebook.

## 📋 Étapes pour ajouter un testeur

### 1. Accéder à la console développeur Meta
- Aller sur [developers.facebook.com](https://developers.facebook.com)
- Se connecter avec le compte admin de l'app Marko

### 2. Sélectionner l'application
- Cliquer sur "My Apps" en haut à droite
- Sélectionner **Marko**

### 3. Ajouter un testeur

#### Option A: Via App Roles (recommandé)
1. Dans le menu de gauche, aller dans **App Roles** → **Roles**
2. Cliquer sur **Add People**
3. Saisir le nom ou l'email du compte Facebook du testeur
4. Sélectionner le rôle **Tester**
5. Cliquer sur **Add**

#### Option B: Via Test Users
1. Dans le menu de gauche, aller dans **Roles** → **Test Users**
2. Cliquer sur **Add** ou **Create Test User**
3. Associer un compte Facebook existant ou créer un compte test

### 4. Le testeur doit accepter l'invitation
Le testeur recevra une notification sur Facebook :
1. Aller sur Facebook
2. Cliquer sur l'icône de notification 🔔
3. Trouver l'invitation de l'app "Marko"
4. Cliquer sur **Accept** / **Accepter**

## ⚠️ Points importants

- Le testeur doit avoir un **compte Instagram Business ou Creator** connecté à une **Page Facebook**
- Le testeur doit autoriser les permissions demandées lors de la connexion OAuth
- Les testeurs doivent ré-accepter si les permissions de l'app changent

## 🔧 Permissions requises par Marko

- `instagram_basic` - Accès aux infos du compte Instagram
- `instagram_content_publish` - Publication de posts sur Instagram
- `pages_show_list` - Liste des pages Facebook
- `pages_read_engagement` - Lecture des métriques
- `business_management` - Gestion des comptes business

## 📧 Contact

Pour être ajouté comme testeur, contactez Ben à benjamin@w3art.io avec :
- Votre email Facebook
- L'email associé à votre compte Instagram Business

---

*Dernière mise à jour : Février 2026*
