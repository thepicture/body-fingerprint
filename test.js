const assert = require("node:assert");
const EventEmitter = require("node:events");
const { describe, it } = require("node:test");

const { multipartFingerprint, jsonFingerprint } = require("./index");

const res = {};
const next = () => {};

describe("multipart", () => {
  it("should parse order of simple multipart disposition", () => {
    const expected = [
      {
        attributes: {
          order: ["name"],
        },
        headers: {
          order: ["Content-Disposition"],
        },
      },
      {
        attributes: {
          order: ["name"],
        },
        headers: {
          order: ["Content-Disposition"],
        },
      },
    ];
    const req = new (class extends EventEmitter {
      get headers() {
        return {
          "content-type":
            "multipart/form-data; boundary=----WebKitFormBoundary1234567890123456",
        };
      }

      setEncoding() {}
    })();

    multipartFingerprint(req, res, next);
    req.emit(
      "data",
      `------WebKitFormBoundary1234567890123456
Content-Disposition: form-data; name="a"

b
------WebKitFormBoundary1234567890123456
Content-Disposition: form-data; name="c"

d
------WebKitFormBoundary1234567890123456--
`.replaceAll("\n", "\r\n")
    );
    req.emit("end");
    const {
      multipart: { parts: actual },
    } = req;

    assert.deepStrictEqual(actual, expected);
  });

  it("should parse order of complex multipart disposition", () => {
    const expected = [
      {
        attributes: {
          order: ["name"],
        },
        headers: {
          order: ["Content-Disposition"],
        },
      },
      {
        attributes: {
          order: ["name"],
        },
        headers: {
          order: ["Content-Disposition"],
        },
      },
      {
        attributes: {
          order: ["name", "filename"],
        },
        headers: {
          order: ["Content-Disposition", "Content-Type"],
        },
      },
    ];
    const req = new (class extends EventEmitter {
      get headers() {
        return {
          "content-type":
            "multipart/form-data; boundary=----WebKitFormBoundary1234567890123456",
        };
      }

      setEncoding() {}
    })();

    multipartFingerprint(req, res, next);
    req.emit(
      "data",
      `------WebKitFormBoundary1234567890123456
Content-Disposition: form-data; name="a"

b
------WebKitFormBoundary1234567890123456
Content-Disposition: form-data; name="c"

d
------WebKitFormBoundary1234567890123456
Content-Disposition: form-data; name="e"; filename=""
Content-Type: application/octet-stream


------WebKitFormBoundary1234567890123456--
`.replaceAll("\n", "\r\n")
    );
    req.emit("end");
    const {
      multipart: { parts: actual },
    } = req;

    assert.deepStrictEqual(actual, expected);
  });

  it("should parse unquoted filenames that contain spaces", () => {
    const expected = [
      {
        attributes: {
          order: ["name"],
        },
        headers: {
          order: ["Content-Disposition"],
        },
      },
      {
        attributes: {
          order: ["name"],
        },
        headers: {
          order: ["Content-Disposition"],
        },
      },
      {
        attributes: {
          order: ["name", "filename"],
        },
        headers: {
          order: ["Content-Disposition", "Content-Type"],
        },
      },
    ];
    const req = new (class extends EventEmitter {
      get headers() {
        return {
          "content-type":
            "multipart/form-data; boundary=----WebKitFormBoundary1234567890123456",
        };
      }

      setEncoding() {}
    })();

    multipartFingerprint(req, res, next);
    req.emit(
      "data",
      `------WebKitFormBoundary1234567890123456
Content-Disposition: form-data; name="a"

b
------WebKitFormBoundary1234567890123456
Content-Disposition: form-data; name="c"

d
------WebKitFormBoundary1234567890123456
Content-Disposition: form-data; name="e"; filename= unquoted filename that contain space
Content-Type: application/octet-stream


------WebKitFormBoundary1234567890123456--
`.replaceAll("\n", "\r\n")
    );
    req.emit("end");
    const {
      multipart: { parts: actual },
    } = req;

    assert.deepStrictEqual(actual, expected);
  });

  it("should access fingerprint", () => {
    const expected = "name;name;name,filename";
    const req = new (class extends EventEmitter {
      get headers() {
        return {
          "content-type":
            "multipart/form-data; boundary=----WebKitFormBoundary1234567890123456",
        };
      }

      setEncoding() {}
    })();

    multipartFingerprint(req, res, next);
    req.emit(
      "data",
      `------WebKitFormBoundary1234567890123456
Content-Disposition: form-data; name="a"

b
------WebKitFormBoundary1234567890123456
Content-Disposition: form-data; name="c"

d
------WebKitFormBoundary1234567890123456
Content-Disposition: form-data; name="e"; filename=""
Content-Type: application/octet-stream


------WebKitFormBoundary1234567890123456--
`.replaceAll("\n", "\r\n")
    );
    req.emit("end");
    const {
      multipart: { fingerprint: actual },
    } = req;

    assert.strictEqual(actual, expected);
  });

  it("should access boundary", () => {
    const expected = "----WebKitFormBoundary1234567890123456";
    const req = new (class extends EventEmitter {
      get headers() {
        return {
          "content-type":
            "multipart/form-data; boundary=----WebKitFormBoundary1234567890123456",
        };
      }

      setEncoding() {}
    })();

    multipartFingerprint(req, res, next);
    req.emit(
      "data",
      `------WebKitFormBoundary1234567890123456
Content-Disposition: form-data; name="a"

b
------WebKitFormBoundary1234567890123456
Content-Disposition: form-data; name="c"

d
------WebKitFormBoundary1234567890123456
Content-Disposition: form-data; name="e"; filename=""
Content-Type: application/octet-stream


------WebKitFormBoundary1234567890123456--
`.replaceAll("\n", "\r\n")
    );
    req.emit("end");
    const {
      multipart: { boundary: actual },
    } = req;

    assert.strictEqual(actual, expected);
  });

  it("should access raw body", () => {
    const multipart = `------WebKitFormBoundary1234567890123456
Content-Disposition: form-data; name="a"

b
------WebKitFormBoundary1234567890123456
Content-Disposition: form-data; name="c"

d
------WebKitFormBoundary1234567890123456
Content-Disposition: form-data; name="e"; filename=""
Content-Type: application/octet-stream


------WebKitFormBoundary1234567890123456--
    `.replaceAll("\n", "\r\n");
    const expected = { body: multipart };
    const req = new (class extends EventEmitter {
      get headers() {
        return {
          "content-type":
            "multipart/form-data; boundary=----WebKitFormBoundary1234567890123456",
        };
      }

      setEncoding() {}
    })();

    multipartFingerprint(req, res, next);
    req.emit("data", multipart);
    req.emit("end");
    const {
      multipart: { raw: actual },
    } = req;

    assert.deepStrictEqual(actual, expected);
  });

  it("should parse boundary header order", () => {
    const expected = [
      "Content-Disposition",
      "Content-Disposition",
      "Content-Disposition",
      "Content-Type",
      "Header-One",
      "Header-Two",
      "Header-three",
      "header-four",
      "HEADER-FIVE",
    ];
    const req = new (class extends EventEmitter {
      get headers() {
        return {
          "content-type":
            "multipart/form-data; boundary=----WebKitFormBoundary1234567890123456",
        };
      }

      setEncoding() {}
    })();

    multipartFingerprint(req, res, next);
    req.emit(
      "data",
      `------WebKitFormBoundary1234567890123456
Content-Disposition: form-data; name="a"

b
------WebKitFormBoundary1234567890123456
Content-Disposition: form-data; name="c"

d
------WebKitFormBoundary1234567890123456
Content-Disposition: form-data; name="e"; filename=""
Content-Type: application/octet-stream
Header-One: value
Header-Two: value
Header-three: value
header-four: value
HEADER-FIVE: value


------WebKitFormBoundary1234567890123456--
`.replaceAll("\n", "\r\n")
    );
    req.emit("end");
    const {
      multipart: {
        headers: { order: actual },
      },
    } = req;

    assert.deepStrictEqual(actual, expected);
  });

  it("should ignore malformed content-type", () => {
    const expected = {
      raw: { body: "" },
      parts: [],
      headers: {
        order: [],
      },
    };
    const req = new (class extends EventEmitter {
      get headers() {
        return {
          "content-type": "==multipart/form-data; boundary",
        };
      }

      setEncoding() {}
    })();

    multipartFingerprint(req, res, next);
    req.emit(
      "data",
      `------WebKitFormBoundary1234567890123456
Content-Disposition: form-data; name="a"

b
------WebKitFormBoundary1234567890123456
Content-Disposition: form-data; name="c"

d
------WebKitFormBoundary1234567890123456
Content-Disposition: form-data; name="e"; filename=""
Content-Type: application/octet-stream
Header-One: value
Header-Two: value
Header-three: value
header-four: value
HEADER-FIVE: value


------WebKitFormBoundary1234567890123456--
`.replaceAll("\n", "\r\n")
    );
    req.emit("end");
    const { multipart: actual } = req;

    assert.deepStrictEqual(actual, expected);
  });

  it("should not ignore content-type with spacing", () => {
    const expected = "name;name;name,filename";
    const req = new (class extends EventEmitter {
      get headers() {
        return {
          "content-type":
            "multipart/form-data;   boundary=----WebKitFormBoundary1234567890123456",
        };
      }

      setEncoding() {}
    })();

    multipartFingerprint(req, res, next);
    req.emit(
      "data",
      `------WebKitFormBoundary1234567890123456
Content-Disposition: form-data; name="a"

b
------WebKitFormBoundary1234567890123456
Content-Disposition: form-data; name="c"

d
------WebKitFormBoundary1234567890123456
Content-Disposition: form-data; name="e"; filename=""
Content-Type: application/octet-stream
Header-One: value
Header-Two: value
Header-three: value
header-four: value
HEADER-FIVE: value


------WebKitFormBoundary1234567890123456--
`.replaceAll("\n", "\r\n")
    );
    req.emit("end");
    const {
      multipart: { fingerprint: actual },
    } = req;

    assert.strictEqual(actual, expected);
  });
});

describe("json", () => {
  it("should parse order of simple json", () => {
    const expected = ["a", "b", "c"];
    const exampleJsonString = JSON.stringify({
      a: 1,
      b: 2,
      c: 3,
    });
    const req = new (class extends EventEmitter {
      get headers() {
        return {
          "content-type": "application/json",
        };
      }

      setEncoding() {}
    })();

    jsonFingerprint(req, res, next);
    req.emit("data", exampleJsonString);
    req.emit("end");
    const {
      json: { order: actual },
    } = req;

    assert.deepStrictEqual(actual, expected);
  });

  it("should parse nested json key order", () => {
    const expected = ["a", "c", "d", "b"];
    const exampleJsonString = JSON.stringify({
      a: 1,
      b: {
        c: 2,
        d: 3,
      },
    });
    const req = new (class extends EventEmitter {
      get headers() {
        return {
          "content-type": "application/json",
        };
      }

      setEncoding() {}
    })();

    jsonFingerprint(req, res, next);
    req.emit("data", exampleJsonString);
    req.emit("end");
    const {
      json: { order: actual },
    } = req;

    assert.deepStrictEqual(actual, expected);
  });

  it("should output comma separated keys for fingerprint", () => {
    const expected = ["a", "c", "d", "b"].join(",");
    const exampleJsonString = JSON.stringify({
      a: 1,
      b: {
        c: 2,
        d: 3,
      },
    });
    const req = new (class extends EventEmitter {
      get headers() {
        return {
          "content-type": "application/json",
        };
      }

      setEncoding() {}
    })();

    jsonFingerprint(req, res, next);
    req.emit("data", exampleJsonString);
    req.emit("end");
    const {
      json: { fingerprint: actual },
    } = req;

    assert.strictEqual(actual, expected);
  });

  it("should access raw property", () => {
    const exampleJsonString = JSON.stringify({
      a: 1,
      b: {
        c: 2,
        d: 3,
      },
    });
    const expected = { body: exampleJsonString };
    const req = new (class extends EventEmitter {
      get headers() {
        return {
          "content-type": "application/json",
        };
      }

      setEncoding() {}
    })();

    jsonFingerprint(req, res, next);
    req.emit("data", exampleJsonString);
    req.emit("end");
    const {
      json: { raw: actual },
    } = req;

    assert.deepStrictEqual(actual, expected);
  });

  it("should fingerprint spaces", () => {
    const exampleJsonString = ' {"a": 5  } ';
    const expected = [" ", " ", " ", " ", " "];
    const req = new (class extends EventEmitter {
      get headers() {
        return {
          "content-type": "application/json",
        };
      }

      setEncoding() {}
    })();

    jsonFingerprint(req, res, next);
    req.emit("data", exampleJsonString);
    req.emit("end");
    const {
      json: { spaces: actual },
    } = req;

    assert.deepStrictEqual(actual, expected);
  });

  it("should fingerprint newline characters", () => {
    const exampleJsonString = ' {"a": 5  \r\n} \r';
    const expected = [" ", " ", " ", " ", "\r", "\n", " ", "\r"];
    const req = new (class extends EventEmitter {
      get headers() {
        return {
          "content-type": "application/json",
        };
      }

      setEncoding() {}
    })();

    jsonFingerprint(req, res, next);
    req.emit("data", exampleJsonString);
    req.emit("end");
    const {
      json: { spaces: actual },
    } = req;

    assert.deepStrictEqual(actual, expected);
  });

  it("should not include value spaces", () => {
    const exampleJsonString = ' {"a": "who ops"  \r\n} \r';
    const expected = [" ", " ", " ", " ", "\r", "\n", " ", "\r"];
    const req = new (class extends EventEmitter {
      get headers() {
        return {
          "content-type": "application/json",
        };
      }

      setEncoding() {}
    })();

    jsonFingerprint(req, res, next);
    req.emit("data", exampleJsonString);
    req.emit("end");
    const {
      json: { spaces: actual },
    } = req;

    assert.deepStrictEqual(actual, expected);
  });

  it("should not include value caret characters", () => {
    const exampleJsonString = ' {"a": "who\\r \\n ops"  \r\n} \r';
    const expected = [" ", " ", " ", " ", "\r", "\n", " ", "\r"];
    const req = new (class extends EventEmitter {
      get headers() {
        return {
          "content-type": "application/json",
        };
      }

      setEncoding() {}
    })();

    jsonFingerprint(req, res, next);
    req.emit("data", exampleJsonString);
    req.emit("end");
    const {
      json: { spaces: actual },
    } = req;

    assert.deepStrictEqual(actual, expected);
  });

  it("can parse spaces inner objects", () => {
    const exampleJsonString = ` {
      "a": 5,
      "b": {
        "c": "a\\n b"
      }
    }`;
    const expected = [
      " ",
      "\n",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      "\n",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      "\n",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      "\n",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      "\n",
      " ",
      " ",
      " ",
      " ",
    ];
    const req = new (class extends EventEmitter {
      get headers() {
        return {
          "content-type": "application/json",
        };
      }

      setEncoding() {}
    })();

    jsonFingerprint(req, res, next);
    req.emit("data", exampleJsonString);
    req.emit("end");
    const {
      json: { spaces: actual },
    } = req;

    assert.deepStrictEqual(actual, expected);
  });

  it("should silently fail on bad body", () => {
    // no double quotes between property key "a"
    const exampleJsonString = ' {a: "who\\r \\n ops"  \r\n} \r';
    const expected = [" ", " ", " ", " ", "\r", "\n", " ", "\r"];
    const req = new (class extends EventEmitter {
      get headers() {
        return {
          "content-type": "application/json",
        };
      }

      setEncoding() {}
    })();

    jsonFingerprint(req, res, next);
    req.emit("data", exampleJsonString);
    req.emit("end");
    const {
      json: { spaces: actual },
    } = req;

    assert.deepStrictEqual(actual, expected);
  });

  it("should have error on fail parse", () => {
    // no double quotes between property key "a"
    const exampleJsonString = ' {a: "who\\r \\n ops"  \r\n} \r';
    const expected = "Unexpected token a in JSON at position 2";
    const req = new (class extends EventEmitter {
      get headers() {
        return {
          "content-type": "application/json",
        };
      }

      setEncoding() {}
    })();

    jsonFingerprint(req, res, next);
    req.emit("data", exampleJsonString);
    req.emit("end");

    const actual = req.json.error.message;

    assert.equal(actual, expected);
  });

  it("should ignore malformed content-type", () => {
    // no double quotes between property key "a"
    const exampleJsonString = '{"a": 1}';
    const expected = {
      raw: { body: "" },
      fingerprint: "",
      spaces: [],
    };
    const req = new (class extends EventEmitter {
      get headers() {
        return {
          "content-type": "_app_licati_on/json",
        };
      }

      setEncoding() {}
    })();

    jsonFingerprint(req, res, next);
    req.emit("data", exampleJsonString);
    req.emit("end");

    const actual = req.json;

    assert.deepStrictEqual(actual, expected);
  });

  it("should not ignore encoding-concise content-type", () => {
    // no double quotes between property key "a"
    const exampleJsonString = '{"a": 1}';
    const expected = "a";
    const req = new (class extends EventEmitter {
      get headers() {
        return {
          "content-type": "application/json;    encoding=UTF-8",
        };
      }

      setEncoding() {}
    })();

    jsonFingerprint(req, res, next);
    req.emit("data", exampleJsonString);
    req.emit("end");

    const {
      json: { fingerprint: actual },
    } = req;

    assert.deepStrictEqual(actual, expected);
  });
});
