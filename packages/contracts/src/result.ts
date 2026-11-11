export type RepositoryError = Readonly<{
  code: "not_found" | "invalid" | "unavailable" | "conflict" | "network" | "unknown";
  message: string;
  retryable: boolean;
}>;

export type Result<T> =
  | Readonly<{ ok: true; data: T }>
  | Readonly<{ ok: false; error: RepositoryError }>;

export const ok = <T>(data: T): Result<T> => ({ ok: true, data });
export const fail = <T = never>(error: RepositoryError): Result<T> => ({ ok: false, error });
