import { Schema, model, Document } from 'mongoose';

export interface IPrayerRequest extends Document {
  userPhone: string;
  userName: string;
  description: string;
  type: 'saude' | 'familia' | 'financas' | 'outros';
  familyMemberName?: string;
  status: 'pendente' | 'em_oracao' | 'atendido';
  isAnonymous: boolean;
  prayerCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PrayerRequestSchema = new Schema<IPrayerRequest>({
  userPhone: { 
    type: String, 
    required: true,
    index: true
  },
  userName: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['saude', 'familia', 'financas', 'outros'],
    required: true 
  },
  familyMemberName: { 
    type: String 
  },
  status: { 
    type: String, 
    enum: ['pendente', 'em_oracao', 'atendido'],
    default: 'pendente',
    index: true
  },
  isAnonymous: { 
    type: Boolean, 
    default: false 
  },
  prayerCount: { 
    type: Number, 
    default: 0 
  }
}, {
  timestamps: true
});

export const PrayerRequest = model<IPrayerRequest>('PrayerRequest', PrayerRequestSchema);