function APIResponse(hasError, Message, Payload) {
    this.hasError = hasError || false,
    this.Message = Message || '';
    this.Payload = Payload || null;
}

APIResponse.prototype.success = function (message, payload) {
  return new APIResponse(false, message || "Success", payload);
};

APIResponse.prototype.error = function (message, payload) {
  return new APIResponse(true, message || "An error occurred", payload);
};

module.exports = APIResponse;