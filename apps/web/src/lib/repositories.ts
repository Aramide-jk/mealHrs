import "server-only";

import type { AppRepositories } from "@mealhrs/contracts";
import { mockRepositories } from "@mealhrs/mocks";
import { createHttpRepositories } from "./http-repositories";

// This is the only application-level composition point for data adapters.
// When configured, it communicates with the Fastify production API (apps/api),
// while preserving mock repositories for decoupled UI development and tests.
const shouldUseHttp =
  process.env.USE_HTTP_API === "true" || process.env.NEXT_PUBLIC_USE_HTTP_API === "true";

export const repositories: AppRepositories = shouldUseHttp
  ? createHttpRepositories(process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000")
  : mockRepositories;
