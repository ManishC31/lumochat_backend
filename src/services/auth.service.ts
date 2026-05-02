import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const generateToken = async (userData: { id: number; email: string }) => {
  const options: jwt.SignOptions = {
    expiresIn: "7d", // token validity
  };
  const token = await jwt.sign(userData, process.env.JWT_SECRET!, options);

  return token;
};

export const encryptPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const verifyPassword = async (inputPassword: string, userPassword: string) => {
  return await bcrypt.compare(inputPassword, userPassword);
};
