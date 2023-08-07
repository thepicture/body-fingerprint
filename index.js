const multipartFingerprint = (req, _, next) => {
  req.setEncoding("utf8");

  req.multipart = {
    raw: { body: "" },
    parts: [],
    headers: {
      order: [],
    },
  };

  if (!req.headers["content-type"]?.includes("multipart")) {
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
  const spaceRegex = /(\s+|\\r\\n|\\r|\\n)/g;

  req.setEncoding("utf8");

  req.json = {
    raw: { body: "" },
    fingerprint: "",
    spaces: [],
  };

  if (!req.headers["content-type"]?.includes("json")) {
    return next();
  }

  req.on("data", (chunk) => (req.json.raw.body += chunk));

  req.on("end", () => {
    const order = [];
    JSON.parse(req.json.raw.body, (key) => {
      if (key) order.push(key);
    });
    req.json.order = order;
    req.json.fingerprint = order.join(",");

    req.json.spaces = req.json.raw.body
      .split(spaceRegex)
      .filter((match) => match.length && /[\r\n\s]/.test(match));

    next();
  });
};

module.exports = {
  multipartFingerprint,
  jsonFingerprint,
};
