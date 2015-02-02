module.exports = function() {
  return {
    configure: function(options) {
      this.host = options.host;
      this.port = options.port;
    }
  };
};
