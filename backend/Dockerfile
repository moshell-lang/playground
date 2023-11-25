FROM rust:1.74-slim as builder
ARG ALLOW_ORIGIN

WORKDIR /usr/src/app

# Generate a dummy project to cache dependencies
RUN cargo init --vcs none
COPY Cargo.toml Cargo.lock ./
RUN cargo build --release

# Build the actual project by forcing a rebuild of the main.rs file
COPY . .
RUN touch src/main.rs && cargo build --release

FROM debian:bookworm-slim as runtime

RUN apt-get update && apt-get install -y bubblewrap util-linux && \
    rm -rf /var/lib/apt/lists/*
COPY --from=ghcr.io/moshell-lang/moshell:master /bin/moshell /usr/bin/moshell
COPY --from=ghcr.io/moshell-lang/moshell:master /usr/share/moshell /usr/share/moshell
COPY --from=builder /usr/src/app/target/release/kronoss /usr/local/bin/kronoss

EXPOSE 3000
ENTRYPOINT ["kronoss"]
