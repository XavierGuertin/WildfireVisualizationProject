FROM postgis/postgis:15-3.3

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    postgresql-server-dev-15 \
    git \
    make \
    cmake \
    pkg-config \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Clone pgSTAC and copy SQL files
RUN git clone --branch v0.9.2 https://github.com/stac-utils/pgstac.git /tmp/pgstac \
    && cd /tmp/pgstac \
    && cp src/pgstac/pgstac.sql /docker-entrypoint-initdb.d/02_pgstac_main.sql \
    && cat src/pgstac/sql/*.sql > /docker-entrypoint-initdb.d/03_pgstac_components.sql \
    && rm -rf /tmp/pgstac

# Copy initialization scripts
COPY init/01_init_extensions.sql /docker-entrypoint-initdb.d/
