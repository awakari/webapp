FROM node:22.6.0-alpine3.20 AS builder
WORKDIR /tmp
COPY . /tmp
RUN \
    npm install -D tailwindcss && \
    npx tailwindcss -i ./tailwind.input.css -o ./web/tailwind.output.css

FROM nginx:1.27.0-alpine3.19
COPY --from=builder /tmp/web /usr/share/nginx/html
EXPOSE 80
