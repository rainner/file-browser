/**
 * Wrapper for successful responses
 */
module.exports = ( code, message, data ) => {
  return {
    statusCode: code || 200,
    message: message || 'Success',
    data: data,
  };
};
