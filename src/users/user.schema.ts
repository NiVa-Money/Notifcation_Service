/* eslint-disable prettier/prettier */
import { Schema, Document } from 'mongoose';

export interface User extends Document {
  _id: string; // assuming _id is used as the unique identifier
  username: string;
  email: string;
  // add other fields as needed
}

export const UserSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  // add additional fields here if needed
});
