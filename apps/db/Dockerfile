# Just clone their Dockerfile directly
FROM ghcr.io/stac-utils/pgstac:v0.8.0

# We can override their default env vars with ours
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=password
ENV POSTGRES_DB=postgres

# Expose PostgreSQL port
EXPOSE 5432
