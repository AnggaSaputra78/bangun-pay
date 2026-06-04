class ApiResponse {
  static success(response, data = null, message = 'Success', statusCode = 200) {
    return response.status(statusCode).json({
      status: 'success',
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  static created(response, data = null, message = 'Resource created successfully') {
    return this.success(response, data, message, 201);
  }

  static error(response, message = 'Error', statusCode = 400, data = null) {
    return response.status(statusCode).json({
      status: 'fail',
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  static noContent(response) {
    return response.status(204).send();
  }

  static paginated(response, data, pagination, message = 'Success') {
    return response.status(200).json({
      status: 'success',
      message,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        pages: pagination.pages,
      },
      timestamp: new Date().toISOString(),
    });
  }
}

export default ApiResponse;