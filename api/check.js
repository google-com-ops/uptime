export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "No URL provided" });
  }

  let statusInfo = {
    alive: false,
    status: null,
    message: "",
    responseTime: 0
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  const start = Date.now();

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal
    });

    const end = Date.now();
    clearTimeout(timeout);

    statusInfo.alive = response.ok;
    statusInfo.status = response.status;
    statusInfo.responseTime = end - start;

    statusInfo.message = getStatusMessage(response.status);

  } catch (err) {
    clearTimeout(timeout);

    statusInfo.alive = false;
    statusInfo.status = "ERROR";
    statusInfo.responseTime = Date.now() - start;

    if (err.name === "AbortError") {
      statusInfo.message = "Timeout (15s)";
    } else if (err.code === "ENOTFOUND") {
      statusInfo.message = "DNS Not Found";
    } else if (err.code === "ECONNREFUSED") {
      statusInfo.message = "Connection Refused";
    } else {
      statusInfo.message = "Network Error";
    }
  }

  res.json(statusInfo);
}

function getStatusMessage(code) {
  const map = {
    200: "OK",
    201: "Created",
    301: "Moved Permanently",
    302: "Found (Redirect)",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    429: "Too Many Requests",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout"
  };

  return map[code] || "Other Status";
    }
