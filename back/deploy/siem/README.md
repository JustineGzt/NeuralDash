# SIEM - Mise en place efficace

Ce dossier fournit un socle simple pour centraliser les logs backend Node.js + Nginx.

## 1) Logs applicatifs (Node.js)

Le serveur Express est configure pour produire des logs JSON via pino/pino-http.

Points importants:
- un `x-request-id` est genere ou propage pour la correlation
- les erreurs API sont logguees au format structuré
- format adapte a Elastic / OpenSearch / Splunk / Sentinel

## 2) Logs proxy (Nginx)

Le fichier [../nginx/progression.conf](../nginx/progression.conf) active:
- `access-siem.log` en JSON
- limite de requetes (`limit_req`)
- limite de connexions (`limit_conn`)
- timeouts courts contre les attaques lentes
- taille max de payload (`client_max_body_size`)

## 3) Collecte vers SIEM

Exemple d'agent:
- Filebeat/Elastic Agent
- Fluent Bit
- Vector
- Azure Monitor Agent

Recommandations:
- parser les JSON natifs (pas de grok si possible)
- enrichir avec geoIP, service name, env
- definir une retention differente pour `access` et `error`
- creer des alertes sur:
  - pics de `429`
  - ratio `5xx` eleve
  - fortes latences upstream
  - IP avec nombre d'erreurs anormal

## 4) Indicateurs minimum a monitorer

- `requests_per_minute`
- `http_4xx_rate`
- `http_5xx_rate`
- `p95_request_time`
- `rate_limited_requests` (status 429)
- `top_offending_ips`

## 5) Bonnes pratiques operationnelles

- synchroniser l'heure (NTP)
- stocker les logs sur disque dedie
- proteger les fichiers de log (permissions)
- tester la restauration des donnees et dashboards
