// src/exceptions/HttpException.ts
export class HttpException extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public response?: any
  ) {
    super(message);
    this.name = 'HttpException';
    Error.captureStackTrace(this, this.constructor);
  }

  getStatus(): number {
    return this.statusCode;
  }

  getResponse(): any {
    return this.response || this.message;
  }
}
