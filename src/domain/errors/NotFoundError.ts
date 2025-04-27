class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";

    // Ensure proper stack trace for debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotFoundError);
    }
  }
}

export default NotFoundError;
