FROM node:20.5.1-alpine3.18 AS builder
WORKDIR /tmp
COPY . /tmp
RUN \
    npm install -D tailwindcss && \
    npx tailwindcss -i ./tailwind.input.css -o ./assets/tailwind.output.css

FROM nginx:1.25.2-alpine3.18
COPY --from=builder /tmp/assets /usr/share/nginx/html
EXPOSE 80
