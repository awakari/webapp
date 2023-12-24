# webapp

Reference Web UI

## 1. Usage

Uses an external identity provider (Google OAuth2 currently).
Navigate https://awakari.com

## 2. Server TLS

```shell
openssl req -x509 -sha256 -newkey rsa:4096 -nodes \
-keyout ca.key \
-out ca.crt \
-addext "subjectAltName=DNS:awakari.com" \
-subj '/O=awakari/CN=awakari.com' \
-days 30
```

```shell
kubectl create secret generic \
  secret-webapp-tls-ca \
  --from-file=ca.crt=ca.crt
```

```shell
openssl req -newkey rsa:4096 -nodes -keyout server.key -out server.csr \
  -addext "subjectAltName=DNS:awakari.com" \
  -subj "/O=awakari"
```

```shell
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial \
  -copy_extensions copyall \
  -extfile <(printf "subjectAltName=DNS:awakari.com") \
  -out server.crt \
  -days 30
```

```shell
kubectl create secret tls \
  secret-webapp-tls-server \
  --key server.key \
  --cert server.crt
```
