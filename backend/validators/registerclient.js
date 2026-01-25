import { body } from "express-validator";

export const registerClientValidator = [
  body("userid")
    .notEmpty()
    .isString()
    .withMessage("UserID is required and should be a string"),
  body("role")
    .notEmpty()
    .isString()
    .isIn(["admin", "recruiter", "student"])
    .withMessage(
      "Role is required and should be either admin or user or student",
    ),
  body("password").notEmpty().isString().withMessage("Password is required "),
];

export const loginClientValidator = [
  body("userid")
    .notEmpty()
    .isString()
    .withMessage("UserID is required and should be a string"),
  body("password").notEmpty().isString().withMessage("Password is required "),
];

export const profileCreationValidator = [
  body("profile_code")
  .notEmpty()
  .isString()
  .withMessage("Profile code is required and should be a string"),

  body("company_name")
  .notEmpty()
  .isString()
  .withMessage("Company name is required and should be a string"),

  body("designation")
  .notEmpty()
  .isString()
  .withMessage("Designation is required and should be a string"),
  
];

export const applicationSubmissionValidator = [
  body("profile_code")
  .notEmpty()
  .withMessage("Profile code is required"),

  body("status")
  .notEmpty()
  .isIn(["Not Selected","Selected","Accepted","Rejected"])
  .withMessage("Status is required and should be one of Not Selected, Selected, Accepted, Rejected"),
];
