# Installation SSL (HTTPS) avec Let's Encrypt

Ce guide permet de securiser l'API en HTTPS via Nginx + Certbot.

## Prerequis

- Un nom de domaine pointe vers votre serveur (ex: `progression.example.com`)
- Les ports `80` et `443` sont ouverts (pare-feu + fournisseur cloud)
- Nginx est installe
- Le backend Node/Nest tourne sur `127.0.0.1:3001`

## 1) Adapter la configuration Nginx

Fichier: `back/deploy/nginx/progression.conf`

Remplacer:
- `progression.example.com` par votre vrai domaine
- les chemins certificats si besoin

Verifier ensuite la syntaxe:

```bash
sudo nginx -t
```

## 2) Installer Certbot

### Ubuntu / Debian

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

### RHEL / CentOS / AlmaLinux

```bash
sudo dnf install -y certbot python3-certbot-nginx
```

## 3) Creer le certificat

Mode Nginx (recommande):

```bash
sudo certbot --nginx -d progression.example.com
```

Ou mode webroot (si vous preferez garder le controle Nginx):

```bash
sudo mkdir -p /var/www/certbot
sudo certbot certonly --webroot -w /var/www/certbot -d progression.example.com
```

## 4) Activer/recharger Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 5) Verifier HTTPS

- Ouvrir `https://progression.example.com/healthz`
- Verifier la redirection `http://progression.example.com` -> HTTPS
- Tester la qualite TLS: https://www.ssllabs.com/ssltest/

## 6) Renouvellement automatique

Verifier le timer systemd:

```bash
systemctl list-timers | grep certbot
```

Tester un renouvellement a blanc:

```bash
sudo certbot renew --dry-run
```

## 7) Bonnes pratiques minimales

- Activer HSTS uniquement apres validation complete HTTPS
- Garder les certificats dans `/etc/letsencrypt/live/<domaine>/`
- Surveiller les erreurs Nginx et les echecs de renouvellement

## Depannage rapide

- `challenge failed`: verifier DNS + port 80 + bloc `/.well-known/acme-challenge/`
- `connection refused`: verifier que Nginx est demarre et accessible publiquement
- `certificate not found`: relancer Certbot puis `sudo nginx -t`
