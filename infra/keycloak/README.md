# Keycloak

Development IAM for ServiYa.

## Local mode

Keycloak runs in development mode on host port `8089` and imports `realm/serviya-realm.json`.

```powershell
$env:SERVIYA_KEYCLOAK_ADMIN_USERNAME = "admin"
$env:SERVIYA_KEYCLOAK_ADMIN_PASSWORD = "set-a-local-dev-password"
docker compose -f infra/compose/keycloak.yml up -d
```

The imported realm is `serviya` and defines:

- Public client: `serviya-web`.
- Confidential client: `serviya-gateway`.
- Realm roles: `CLIENTE`, `TECNICO`, `ADMIN`.

Do not store real secrets in this directory.
