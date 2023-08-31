# webapp

Reference Web UI

## 1. Access

Awakari uses 2-factor authentication:
1. Client TLS certificate.
2. 3-rd party identity provider (Google OAuth2 currently).

First, install the <a href="https://raw.githubusercontent.com/awakari/webapp/master/ca.crt" download="ca.crt">CA</a>. 

Navigate [https://demo.awakari.cloud/web](https://demo.awakari.cloud/web)

## 2. Usage

TODO

## 3. TODO

Converting the client certificate for the browser/mobile phone usage:
```shell
openssl pkcs12 -export -in client.crt -inkey client.key -out client.p12
openssl pkcs12 -nodes < client.p12 > /tmp/certbag.pem
openssl pkcs12 -export -legacy -in /tmp/certbag.pem > client.legacy.p12
```
