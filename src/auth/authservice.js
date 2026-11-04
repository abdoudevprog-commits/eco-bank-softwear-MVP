import User from "../User/models/userRepo.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const registeruser = async (data) => {
  const { username,email ,  password } = data;

  const exists = await User.findOne({ email , username });
  if (exists) {
    const error = new Error("User already exists");
    error.status = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  return {
    message: "User created successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  };
};

export const loginuser = async (data) => {
  const { username,email,  password } = data;

  const user = await User.findOne({ email , username });
  if (!user) {
    const error = new Error("No such user name");
    error.status = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid password");
    error.status = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: user._id, username: user.username, email: user.email },
    process.env.JWT_SECRET ,
    { expiresIn: "1d" }
  );

  return {
    message: "Login successful",
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  };
};