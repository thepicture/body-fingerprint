const multipartFingerprint = (req, _, next) => {
  req.setEncoding("utf8");

  req.multipart = {
    raw: { body: "" },
    parts: [],
    headers: {
      order: [],
    },
  };

  if (
    !/multipart\/form-data;\s.*boundary\=.+/.test(req.headers["content-type"])
  ) {
    return next();
  }

  [, req.multipart.boundary] = req.headers["content-type"].split("=");

  req.on("data", (chunk) => (req.multipart.raw.body += chunk));

  req.on("end", () => {
    const [, ...headers] = req.multipart.raw.body
      .split(`${req.multipart.boundary}\r\n`)
      .map((part) => part.split(/(\r\n){2}/));

    headers.forEach(([header]) => {
      const headerOrder = header
        .split("\r\n")
        .map((line) => line.split(/:/)[0]);

      const [, ...pairs] = header.split(/; /);
      req.multipart.headers.order.push(...headerOrder);

      const part = {
        attributes: {
          order: [],
        },
        headers: {
          order: headerOrder,
        },
      };
      let current = pairs.join("; ");

      while (current?.includes("=")) {
        part.attributes.order.push(current.split("=")[0]);
        current = current.split("; ")[1];
      }

      req.multipart.parts.push(part);
      req.multipart.fingerprint = req.multipart.parts
        .map(({ attributes: { order } }) => order)
        .join(";");
    });

    next();
  });
};

const jsonFingerprint = (req, _, next) => {
  req.setEncoding("utf8");

  req.json = {
    raw: { body: "" },
    fingerprint: "",
    spaces: [],
  };

  if (!/application\/json(.+)?/.test(req.headers["content-type"])) {
    return next();
  }

  req.on("data", (chunk) => (req.json.raw.body += chunk));

  req.on("end", () => {
    const order = [];

    try {
      JSON.parse(req.json.raw.body, (key) => {
        if (key) order.push(key);
      });
    } catch (error) {
      req.json.error = error;
    }

    req.json.order = order;
    req.json.fingerprint = order.join();

    const spaces = [];
    let currentSpace = "";

    let isInsideString = false;

    for (let i = 0; i < req.json.raw.body.length; i++) {
      const char = req.json.raw.body[i];

      if (char === '"') {
        isInsideString = !isInsideString;
      }

      if (!isInsideString && (char === " " || char === "\r" || char === "\n")) {
        if (currentSpace !== "") {
          spaces.push(currentSpace);
          currentSpace = "";
        }
        spaces.push(char === " " ? " " : char === "\r" ? "\r" : "\n");
      } else {
        currentSpace += char;
      }
    }

    req.json.spaces = spaces.filter((entry) =>
      ["\r", "\n", " "].includes(entry)
    );

    next();
  });
};

module.exports = {
  multipartFingerprint,
  jsonFingerprint,
};
