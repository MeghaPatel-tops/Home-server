const { ValidationError } = require('../core/errors');

const validate = (schema) => {
  return async (req, res, next) => {
    try {
      const dataToValidate = {
        body: req.body,
        query: req.query,
        params: req.params,
      };

      const result = await schema.parseAsync(dataToValidate);
      if (result.body) req.body = result.body;
      if (result.query) req.query = result.query;
      if (result.params) req.params = result.params;
      next();
    } catch (err) {
      if (err.errors) {
        const formatted = err.errors.map((e) => ({
          field: e.path.join('.').replace(/^(body|query|params)\./, ''),
          message: e.message,
        }));
        return next(new ValidationError(formatted));
      }
      next(err);
    }
  };
};

module.exports = validate;
