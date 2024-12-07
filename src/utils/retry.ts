/* eslint-disable no-promise-executor-return */
export class RetryStrategy {
  constructor(
    private maxRetries: number,
    private delay: number,
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.maxRetries; attempt += 1) {
      try {
        // eslint-disable-next-line no-await-in-loop
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (attempt === this.maxRetries) break;
        // eslint-disable-next-line no-await-in-loop
        await this.wait(attempt);
      }
    }

    // eslint-disable-next-line no-throw-literal
    throw lastError!;
  }

  private wait(attempt: number): Promise<void> {
    return new Promise((resolve) =>
      setTimeout(resolve, this.delay * 2 ** (attempt - 1)),
    );
  }
}
