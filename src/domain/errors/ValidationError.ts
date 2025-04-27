class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";

    // Ensure proper stack trace for debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}

export default ValidationError;
