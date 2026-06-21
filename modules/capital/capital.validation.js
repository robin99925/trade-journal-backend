const { body } = require("express-validator");

const amountValidation = [
  body("amount")
    .isNumeric()
    .withMessage("Amount must be numeric")
    .custom((value) => value > 0)
    .withMessage("Amount must be greater than 0"),
];

module.exports = {
  amountValidation,
};
