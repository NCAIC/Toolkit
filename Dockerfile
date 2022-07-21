FROM node:lts
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# Install TypeScript Toolchain
RUN npm i -g esbuild
# Install Rust Toolchain
RUN curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | bash -s -- -y
# Install Python Toolchain
RUN apt update && apt install -y software-properties-common && add-apt-repository ppa:deadsnakes/ppa && apt update && apt install -y python
# Install Go Toolchain
RUN curl -LO https://get.golang.org/$(uname)/go_installer && chmod +x go_installer && ./go_installer && rm go_installer

WORKDIR /app
COPY . .
RUN npx -y pnpm i

CMD [ "node", "dist/index.js" ]
