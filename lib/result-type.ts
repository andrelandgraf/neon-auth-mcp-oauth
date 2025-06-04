export type Result<T, E extends Error> =
  | {
      success: true;
      value: T;
    }
  | {
      success: false;
      error: E;
    };

export function succeeded<T>(value: T): { success: true; value: T } {
  return { success: true, value };
}

export function failed<E extends Error>(
  error: E,
): { success: false; error: E } {
  return { success: false, error };
}

export function withResult<T>(fn: () => T): Result<T, Error> {
  try {
    const value = fn();
    return succeeded(value);
  } catch (error) {
    if (error instanceof Error) {
      return failed(error);
    }
    return failed(new Error(String(error)));
  }
}

export async function withResultAsync<T>(
  fn: () => Promise<T>,
): Promise<Result<T, Error>> {
  try {
    const value = await fn();
    return succeeded(value);
  } catch (error) {
    if (error instanceof Error) {
      return failed(error);
    }
    return failed(new Error(String(error)));
  }
}
