FROM ghcr.io/pnpm/pnpm:12

# Install Node.js runtime
RUN pnpm runtime set node 24 -g

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

RUN useradd --system --create-home --shell /usr/sbin/nologin appuser \
    && chown -R appuser:appuser /app

USER appuser

EXPOSE 5000

CMD ["node", "dist/src/server.js"]
