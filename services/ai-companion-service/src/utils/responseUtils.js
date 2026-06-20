function successResponse(res, data, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data, timestamp: new Date().toISOString() });
}

function errorResponse(res, message = 'An error occurred', statusCode = 400, errors = null) {
  const response = { success: false, message, timestamp: new Date().toISOString() };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
}

function paginatedResponse(res, data, total, page, limit, message = 'Success') {
  const totalPages = Math.ceil(total / limit);
  return res.status(200).json({
    success: true, message, data,
    pagination: { total, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    timestamp: new Date().toISOString(),
  });
}

module.exports = { successResponse, errorResponse, paginatedResponse };
