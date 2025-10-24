import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  phone: string;
  name?: string;
  dateOfBirth?: Date;
  maritalStatus?: string;
  address?: string;
  profession?: string;
  howFoundChurch?: string;
  registrationDate: Date;
  isMember: boolean;
  lastInteraction: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  phone: { 
    type: String, 
    required: true,
    unique: true,
    index: true
  },
  name: { 
    type: String 
  },
  dateOfBirth: { 
    type: Date 
  },
  maritalStatus: { 
    type: String 
  },
  address: { 
    type: String 
  },
  profession: { 
    type: String 
  },
  howFoundChurch: { 
    type: String 
  },
  registrationDate: { 
    type: Date, 
    default: Date.now 
  },
  isMember: { 
    type: Boolean, 
    default: false 
  },
  lastInteraction: { 
    type: Date, 
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

export const User = model<IUser>('User', UserSchema);