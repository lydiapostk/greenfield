# Spinning up PostGres

In the `db` directory, run the following command:
`docker compose --env-file ../.env up -d`

To stop the container, run:
`docker-compose down   # stops but keeps data`

To wipe data:
`docker-compose down -v   # deletes containers + volumes (wipes data)`

To manage PostGres from UI after spinning up the docker images:

1. Go to `http://localhost:8080`
2. Login with the credentials from your .env:
    - Email: `PGADMIN_DEFAULT_EMAIL`
    - Password: `PGADMIN_DEFAULT_PASSWORD`

# Configuring safe API types for NextJS

In the `greenfield` directory, run the following command each time an API function signature changes:
`npx openapi-typescript http://localhost:8000/openapi.json -o app/types/api.ts`
