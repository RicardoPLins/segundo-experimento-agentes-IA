export class ValidationError extends Error {
    status = 400;
}
export class NotFoundError extends Error {
    status = 404;
}
export class ConflictError extends Error {
    status = 409;
}
export class PersistenceError extends Error {
    status = 500;
}
