export class ClinicError extends Error {
  constructor(message, statusCode = 400, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = "ClinicError";
  }
}
