import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export interface IUser extends Document {
  email: string;
  password: string;
  generateAuthToken(): string;
}
