FROM golang:latest as go-env
FROM rust:latest as rust-env

FROM node:lts
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# Install TypeScript Toolchain
RUN npm i -g esbuild
# Install Python Toolchain
RUN rm /usr/bin/python && ln -s /usr/bin/python3 /usr/bin/python
# Install Go Toolchain
COPY --from=go-env /usr/local/go /usr/local/go
ENV PATH=$PATH:/usr/local/go/bin
# Install Rust Toolchain
COPY --from=rust-env /usr/local/cargo /usr/local/cargo
ENV PATH=$PATH:/usr/local/cargo/bin
RUN rustup default stable

WORKDIR /app
COPY . .
RUN npx -y pnpm i

ENTRYPOINT [ "node", "dist/index.js" ]
