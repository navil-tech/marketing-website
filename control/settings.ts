import { join } from "node:path";
import type { Engine } from "./matrix";

export const runId = process.env["CONTROL_RUN_ID"] ?? new Date().toISOString().replace(/\D/g, "").slice(0, 14);

export const upstream = new URL(process.env["CONTROL_TARGET"] ?? "http://127.0.0.1:3000");

export const gatewayPort = Number(process.env["CONTROL_GATEWAY_PORT"] ?? 3100);

export const sinkPort = Number(process.env["CONTROL_SINK_PORT"] ?? 3101);

export const externalGateway = process.env["CONTROL_GATEWAY_URL"];

export const outDir = join("control", "out", runId);

export const accessLog = process.env["CONTROL_ACCESS_LOG"] ?? join(outDir, "access.log");

export const concurrency = Number(process.env["CONTROL_CONCURRENCY"] ?? 4);

export const pauseMs = Number(process.env["CONTROL_PAUSE_MS"] ?? 0);

export const engines = (process.env["CONTROL_ENGINES"] ?? "chromium,firefox,webkit").split(",") as Engine[];

export const only = process.env["CONTROL_ONLY"]?.split(",");
