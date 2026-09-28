export class ApiResponse {
  static success(res, message = 'Success', data = {}, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(res, message = 'An error occurred', error = null, statusCode = 500) {
    const response = {
      success: false,
      message,
    };
    if (error) {
      response.error = typeof error === 'string' ? error : error.message || error;
    }
    return res.status(statusCode).json(response);
  }
}
