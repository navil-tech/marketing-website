import { randomUUID } from "node:crypto";
import { createWriteStream, type WriteStream } from "node:fs";
import {
  createServer,
  request as httpRequest,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from "node:http";

export const CLIENT_IP_HEADER = "x-control-client-ip";

export interface AccessRecord {
  time: number;
  requestTime: number;
  requestId: string;
  ip: string;
  method: string;
  uri: string;
  status: number;
  userAgent: string;
  referer: string;
  secFetchDest: string;
}

export interface Gateway {
  url: string;
  close: () => Promise<void>;
}

export function startGateway(upstream: URL, port: number, logPath: string): Promise<Gateway> {
  const log: WriteStream = createWriteStream(logPath, { flags: "a" });
  const server: Server = createServer((incoming: IncomingMessage, outgoing: ServerResponse) => {
    forward(upstream, incoming, outgoing, log);
  });
  return new Promise((resolve) => {
    server.listen(port, "127.0.0.1", () => {
      resolve({
        url: `http://127.0.0.1:${port}`,
        close: () =>
          new Promise((done) => {
            server.closeAllConnections();
            server.close(() => log.end(done));
          }),
      });
    });
  });
}

function forward(upstream: URL, incoming: IncomingMessage, outgoing: ServerResponse, log: WriteStream): void {
  const receivedAt = Date.now();
  const requestId = randomUUID();
  const ip = headerValue(incoming, CLIENT_IP_HEADER) || incoming.socket.remoteAddress || "";
  const headers = { ...incoming.headers };
  delete headers[CLIENT_IP_HEADER];
  headers["x-request-id"] = requestId;
  headers["x-forwarded-for"] = ip;
  headers["x-forwarded-proto"] = "http";
  const proxied = httpRequest(
    {
      hostname: upstream.hostname,
      port: upstream.port,
      method: incoming.method,
      path: incoming.url,
      headers,
    },
    (response: IncomingMessage) => {
      outgoing.writeHead(response.statusCode ?? 502, response.headers);
      response.pipe(outgoing);
      response.on("end", () => {
        const finishedAt = Date.now();
        const record: AccessRecord = {
          time: finishedAt / 1000,
          requestTime: (finishedAt - receivedAt) / 1000,
          requestId,
          ip,
          method: incoming.method ?? "",
          uri: incoming.url ?? "",
          status: response.statusCode ?? 0,
          userAgent: headerValue(incoming, "user-agent"),
          referer: headerValue(incoming, "referer"),
          secFetchDest: headerValue(incoming, "sec-fetch-dest"),
        };
        log.write(`${JSON.stringify(record)}\n`);
      });
    },
  );
  proxied.on("error", () => {
    outgoing.writeHead(502);
    outgoing.end();
  });
  incoming.pipe(proxied);
}

function headerValue(incoming: IncomingMessage, name: string): string {
  const value = incoming.headers[name];
  return typeof value === "string" ? value : "";
}
