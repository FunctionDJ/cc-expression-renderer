export class TimeoutWrapper {
  private handler?: number;

  constructor(private readonly debugName?: string) {}

  has(): boolean {
    this.debug('has', this.handler);
    return this.handler !== undefined;
  }

  set(handler: number): void {
    this.debug('set', handler);
    this.handler = handler;
  }

  clear(): void {
    this.debug('clear', this.handler);
    clearInterval(this.handler);
    this.handler = undefined;
  }

  private debug(...message: Array<number|string|undefined>) {
    if (this.debugName !== undefined) {
      console.log(`${this.debugName}:`, ...message);
    }
  }
}
