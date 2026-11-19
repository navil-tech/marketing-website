import { createWriteStream, type WriteStream } from "node:fs";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";

export interface SinkRecord {
  time: number;
  chatId: string;
  threadId: number | null;
  text: string;
}

export interface Sink {
  received: () => number;
  close: () => Promise<void>;
}

export function startSink(port: number, logPath: string): Promise<Sink> {
  const log: WriteStream = createWriteStream(logPath, { flags: "a" });
  let received = 0;
  const server: Server = createServer((incoming: IncomingMessage, outgoing: ServerResponse) => {
    let body = "";
    incoming.on("data", (chunk: Buffer) => {
      body += chunk.toString("utf8");
    });
    incoming.on("end", () => {
      const message = JSON.parse(body) as { chat_id: string; message_thread_id?: number; text: string };
      received += 1;
      const record: SinkRecord = {
        time: Date.now(),
        chatId: message.chat_id,
        threadId: message.message_thread_id ?? null,
        text: message.text,
      };
      log.write(`${JSON.stringify(record)}\n`);
      outgoing.setHeader("content-type", "application/json");
      outgoing.end(JSON.stringify({ ok: true, result: { message_id: received } }));
    });
  });
  return new Promise((resolve) => {
    server.listen(port, "127.0.0.1", () => {
      resolve({
        received: () => received,
        close: () =>
          new Promise((done) => {
            server.closeAllConnections();
            server.close(() => log.end(done));
          }),
      });
    });
  });
}
