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
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary1234567890123456

------WebKitFormBoundary1234567890123456
Content-Disposition: form-data; name="a"

b
------WebKitFormBoundary1234567890123456
Content-Disposition: form-data; name="c"

d
------WebKitFormBoundary1234567890123456
Content-Disposition: form-data; name="e"; filename=""
Content-Type: application/octet-stream


------WebKitFormBoundary1234567890123456--
```

Generated `req.multipart` object:

```json
{
  "parts": [
    {
      "attributes": {
        "order": ["name"]
      },
      "headers": {
        "order": ["Content-Disposition"]
      }
    },
    {
      "attributes": {
        "order": ["name"]
      },
      "headers": {
        "order": ["Content-Disposition"]
      }
    },
    {
      "attributes": {
        "order": ["name", "filename"]
      },
      "headers": {
        "order": ["Content-Disposition", "Content-Type"]
      }
    }
  ]
}
```

## JSON Fingerprint

Request:

```js
POST /json HTTP/1.1
Host: example.com
Content-Type: application/json

{
  a: 1,
  b: {
    c: 2,
    d: 3,
  }
}
```

Generated `req.json` object:

```json
{
  "fingerprint": "a,b,c,d",
  "order": ["a", "b", "c", "d"],
  "spaces": [" ", "\r", " \r", ... "\r"] // spaces fingerprint of json structure
}
```

## Options

`depthFirstOrder` - traverses keys using depth-first search

```js
{
  a: 1,
  b: {
    c: 2,
    d: 3,
  }
}
```

produces `a,c,d,b` if `depthFirstOrder` is `true`. `false` by default

## Entropy

A property value representing Shannon entropy. `null` by default

- For multipart access through `req.multipart.entropy`

- For JSON access through `req.json.entropy`

## Test

```js
npm test
```
