import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
	name: string;
	email: string;
	password: string;
	createdAt: Date;
	token?:string
}

const userSchema = new Schema<IUser>(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		token: { type: String, required: false },
	},
	{ timestamps: true },
);

const User = model<IUser>('User', userSchema);
export default User;
