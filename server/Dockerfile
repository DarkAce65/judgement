FROM hayd/deno:1.6.2

WORKDIR /server
EXPOSE 8000

COPY deps.ts .
RUN deno cache deps.ts

COPY . .
