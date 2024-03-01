FROM node:20.11.1-alpine3.19 AS builder
WORKDIR /tmp
COPY . /tmp
RUN \
    npm install -D tailwindcss && \
    npx tailwindcss -i ./tailwind.input.css -o ./web/tailwind.output.css

FROM nginx:1.25.4-alpine3.18
COPY --from=builder /tmp/web /usr/share/nginx/html
EXPOSE 80
