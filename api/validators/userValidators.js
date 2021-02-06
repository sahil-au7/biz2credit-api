//Validators File it will contain user validators

import { check, body } from "express-validator";

import encryptionService from "../services/encryptionService";
import User from "../models/userModel";
import Error from "../errorHandlers/CustomError";

const validator = {};

//==========================================Signup Validator==========================================
validator.signup = [
  //Check name
  check("name", "Invalid Name character length should be 3 to 20")
    .isString()
    .isLength({
      min: 3,
      max: 20,
    }),

  //Check if email is valid
  check("email", "Invalid Email").isEmail(),

  //Check if email is unique
  body("email").custom(async (email) => {
    const user = await User.findOne({
      email,
    });

    if (user) {
      throw new Error(409, "User already exists");
    }
  }),

  //Check if password length is minimum 8 characters 20 characters maximum
  check(
    "password",
    "Password must contain at least 8 characters and max 20 characters"
  ).isLength({
    min: 8,
    max: 20,
  }),

  //Check if phone number is valid
  check("contact", "Invalid Phone Number").isMobilePhone().isLength({
    min: 10,
    max: 10,
  }),
];

//==========================================Login Validator==========================================
validator.login = [
  //Check if email is valid
  check("email", "Invalid Email").isEmail().bail(),

  //Check if email is unique
  body("email")
    .custom(
      (email) =>
        new Promise(async (res, rej) => {
          try {
            const user = await User.findOne({
              email: email.toLowerCase(),
            });

            if (!user) throw new Error(409, "User doesn't exists");
            res();
          } catch (err) {
            console.log(err);
            rej(err);
          }
        })
    )
    .bail(),

  //Check if password is correct
  body("password").custom(
    (password, { req }) =>
      new Promise(async (res, rej) => {
        try {
          const { email } = req.body;
          //Get user related to this email
          //NOTE : Make sure to add .select('password) in the query to get the password field in the returned document
          const user = await User.findOne({
            email: email.toLowerCase(),
          }).select("password");

          //Check if password is correct
          const isVerified = await encryptionService.verify(
            password,
            user.password
          );

          //If password is not correct throw error
          if (!isVerified) throw new Error(401, "Invalid Email or Password");

          res();
        } catch (e) {
          console.log(e);
          rej(e);
        }
      })
  ),
];

//==========================================Update Validator==========================================

validator.update = [
  //These fields user can't update
  check("_id", "Cannot update id").isEmpty(),

  check("created_at", "Cannot update created_at").isEmpty(),

  check("login_at", "Cannot update login_at").isEmpty(),

  //Check name
  check("name", "Invalid Name character length should be 3 to 20")
    .isString()
    .isLength({
      min: 3,
      max: 20,
    }),

  //Check if email is unique
  body("email").custom((email) => {
    if (email) {
      throw new Error("Email cannot be changed");
    }
  }),

  //Check if password length is minimum 8 characters max 20 characters maximum
  check(
    "password",
    "Password must contain at least 8 characters and max 20 characters"
  ).isLength({
    min: 8,
    max: 20,
  }),

  //Check if phone number is valid
  check("contact", "Invalid Phone Number").isMobilePhone(),
];

export default validator;
