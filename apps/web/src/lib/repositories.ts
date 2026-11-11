import "server-only";

import type { AppRepositories } from "@mealhrs/contracts";
import { mockRepositories } from "@mealhrs/mocks";

// This is the only application-level composition point for data adapters.
// The future HTTP adapter can replace the mock without changing feature UI.
export const repositories: AppRepositories = mockRepositories;
