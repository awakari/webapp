# webapp
Reference Web UI

Converting the client certificate for the browser/mobile phone usage:
```shell
openssl pkcs12 -export -in client.crt -inkey client.key -out client.p12
openssl pkcs12 -nodes < client.p12 > /tmp/certbag.pem
openssl pkcs12 -export -legacy -in /tmp/certbag.pem > client.legacy.p12
```
