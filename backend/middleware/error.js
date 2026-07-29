export const errorHandler = (err, req, res, _next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || 'Internal Server Error';

    // Handle Mongoose CastError (e.g. invalid ObjectId format)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid field format for: ${err.path}`;
    }

    // Handle Mongoose ValidationError
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(', ');
    }

    // In production, mask stack traces & raw internal error messages for 500 status codes
    const isProduction = process.env.NODE_ENV === 'production';
    if (statusCode === 500 && isProduction) {
        message = 'Internal Server Error';
    }

    // Authentication and validation failures are expected client responses, not
    // server errors. Avoid cluttering logs (and avoid exposing internals) for
    // those normal 4xx paths.
    if (statusCode >= 500) {
        if (isProduction) {
            console.error(`Internal server error for ${req.method} ${req.originalUrl}`);
        } else {
            console.error(`Status code ${statusCode} - Error:`, err.message, err.stack);
        }
    }

    res.status(statusCode).json({
        success: false,
        message,
        data: null
    });
};
