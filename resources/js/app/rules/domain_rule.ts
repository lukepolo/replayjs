export default {
  passes(value: any, parameters = [], data: {}) {
    let domainRegex = new RegExp(
      "^([a-zA-Z0-9]([a-zA-Z0-9\\-]{0,63}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,63}$",
    );
    return domainRegex.test(value);
  },

  message() {
    return "This :field must be a valid domain.";
  },
};
