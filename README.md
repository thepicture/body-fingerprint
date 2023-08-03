# body-fingerprint

## Install

```bash
npm install body-fingerprint
```

## Usage

```js
const express = require("express");
const app = express();

const { bodyFingerprint, jsonFingerprint } = require("body-fingerprint");

app.use(bodyFingerprint);
app.use(jsonFingerprint);

app.get("/", (_, res) =>
  res.send(`
<script>
body = new FormData();
body.set('a', 'b');
body.set('c', 'd');
body.set('e', new File([], ''))
fetch('/', {
    method: 'post', 
    body})
    .then((res) => res.text())
    .then((res) => document.body.insertAdjacentHTML(
        'beforebegin',
        '<span style="white-space: pre-line">' + res + '</span>'
    ));
fetch('/', {
    method: 'post', 
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({
        a: 'b',
        c: 'd', 
        e: {
            f: 'g'
        }
    })
})
    .then((res) => res.text())
    .then((res) => document.body.insertAdjacentHTML(
        'beforebegin',
        '<span style="white-space: pre-line">' + res + '</span>'
    ))    
</script>
`)
);

app.post("/", (req, res) => {
  res.send([req.multipart.fingerprint, req.json.fingerprint]);
});

app.listen(3000);
```

## Multipart Fingerprint

Request:

```
POST /multipart HTTP/1.1
Host: example.com
Content-Type: multipart/form-data;

boundary=---------------------------1234567890
Content-Disposition: form-data; name="e"
Content-Disposition: form-data; name="c"; filename="profile.jpg"
```

Generated `req.multipart` object:

```json
{
  "parts": [["name"], ["name", "filename"]],
  "fingerprint": "name;name,filename"
}
```

## JSON Fingerprint

Request:

```
POST /json HTTP/1.1
Host: example.com
Content-Type: application/json

{
  "key": "value",
  "k2": 30,
  "a": {
    "b": "e",
    "c": "f"
  }
}
```

Generated `req.json` object:

```json
{
  "fingerprint": "key,k2,a,b,c",
  "order": ["key", "k2", "a", "b", "c"]
}
```
