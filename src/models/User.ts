import mongoose, { Schema, Document } from 'mongoose';
export interface IUser extends Document {
    email: string;
    password: string;
    username: string;
    isAdmin: boolean;
    endereco: string;
}
const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    endereco: { type: String, default: '' },
}, {
    timestamps: true, // Adiciona campos createdAt e updatedAt automaticamente
});
export const User = mongoose.model<IUser>('User', UserSchema);