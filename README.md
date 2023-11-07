# webapp

Reference Web UI

## 1. Usage

Uses 2-factor authentication:
1. Client TLS certificate.
2. External identity provider (Google OAuth2 currently).

Steps to access:
1. Install the [CA](https://awakari.com/certs/awakari-demo-ca.crt).
2. Install the [client certificate](https://awakari.com/certs/awakari-demo-client-0.p12).
3. Navigate https://demo.awakari.cloud/web

## 2. Convert own certificate

Converting the client certificate for the browser/mobile phone usage:
```shell
openssl pkcs12 -export -in client.crt -inkey client.key -out client.p12
openssl pkcs12 -nodes < client.p12 > /tmp/certbag.pem
openssl pkcs12 -export -legacy -in /tmp/certbag.pem > client.legacy.p12
```
