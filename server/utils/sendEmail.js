//sendEmail.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { hashString } from "./index.js";
import PasswordReset from "../models/PasswordReset.js";

dotenv.config();

const { AUTH_EMAIL, AUTH_PASSWORD, APP_URL } = process.env;

// Gmail SMTP configuration
let transporter = nodemailer.createTransport({
  service: "gmail", // Use Gmail's SMTP server
  auth: {
    user: AUTH_EMAIL, // your Gmail address
    pass: AUTH_PASSWORD, // your Gmail password or app-specific password
  },
});

// sendEmail.js
export const sendVerificationEmail = async (
  { email, token, lastName },
  res
) => {
  const link = `${APP_URL}auth/verify-email/${token}`;

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "Verify your email address",
    html: `
      <div style='font-family: Arial, sans-serif; font-size: 20px; color: #333;'>
        <h3>Hi ${lastName},</h3>
        <p>Click the link below to verify your email address:</p>
        <a href="${link}" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none;">
          Verify Email
        </a>
        <p>This link will expire in 1 hour.</p>
      </div>`,
  };

  return transporter.sendMail(mailOptions);
};

// Function to send password reset email
export const resetPasswordLink = async (user, res) => {
  const { _id, email } = user;
  const token = _id + uuidv4();
  const link = `${APP_URL}users/reset-password/${_id}/${token}`;

  const mailOptions = {
    from: AUTH_EMAIL,
    to: email,
    subject: "Password Reset",
    html: `
      <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333; background-color: #f7f7f7; padding: 20px; border-radius: 5px;">
        Password reset link. Please click the link below to reset password.
        <br>
        <p style="font-size: 18px;"><b>This link expires in 10 minutes</b></p>
        <br>
        <a href="${link}" style="color: #fff; padding: 10px; text-decoration: none; background-color: #000; border-radius: 8px; font-size: 18px;">
          Reset Password
        </a>.
      </p>`,
  };

  try {
    const hashedToken = await hashString(token);
    const resetEmail = await PasswordReset.create({
      userId: _id,
      email,
      token: hashedToken,
      createdAt: Date.now(),
      expiresAt: Date.now() + 600000, // Token expires in 10 minutes
    });

    if (resetEmail) {
      transporter
        .sendMail(mailOptions)
        .then(() => {
          res.status(201).send({
            success: "PENDING",
            message: "Reset Password Link has been sent to your account.",
          });
        })
        .catch((err) => {
          console.error(err);
          res.status(404).json({ message: "Something went wrong" });
        });
    }
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: "Something went wrong" });
  }
};
