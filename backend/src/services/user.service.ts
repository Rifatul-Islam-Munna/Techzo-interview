import { Constants } from '@/config';
import User, { IUser } from '@/models/user.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
export const getAllUsers = async (): Promise<IUser[]> => {
	const users = await User.find().select('-password').exec();
	return users;
};

export const createUser = async (data: {name:string,email:string,password:string}): Promise<IUser> => {
  if(!data.password){
    throw new Error('Password is required');
  }
  const isAlredyThere = await User.exists({ email: data.email }).exec();

  if (isAlredyThere) {
    throw new Error('User already exists');
  }
  const newPassord = await hashPassword(data.password);
  const object ={
    ...data,
    password: newPassord
  }
	const user = new User(object);
	return user.save();
};
export const login = async (email: string, password: string,fmcToken:string | null) => {
  const user = await User.findOne({ email }).lean().exec();

  if (!user) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return null;
  }
   const updateUSer = await User.findOneAndUpdate(
    { _id: user._id },
    { token:fmcToken },
    { new: true }
   ).lean().exec();
  const token = jwt.sign(
    { id: user._id, email: user.email,name:user.name },
    Constants.JWT_SECRET,
    { expiresIn: Constants.JWT_EXPIRES_IN }
  );




  return {
    user: user,
    token,
  };
};

export const getUserById = async (userId: string): Promise<IUser | null> => {
  const user = await User.findById(userId).select('-password').exec();
  return user;
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};