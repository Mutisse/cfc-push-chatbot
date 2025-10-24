import { Schema, model, Document, Types } from 'mongoose';

export interface ISessionData {
  // Cadastro
  name?: string;
  dateOfBirth?: string;
  maritalStatus?: string;
  address?: string;
  profession?: string;
  howFoundChurch?: string;
  
  // Oração
  prayerType?: string;
  prayerDetail?: string;
  prayerFamilyName?: string;
  
  // Assistência
  assistanceType?: string;
  assistanceDetail?: string;
  
  // Transferência
  previousChurch?: string;
  transferReason?: string;
  
  // Atualização
  updateField?: string;
  
  // Visita
  visitDate?: string;
  visitReason?: string;
  
  // Pastor
  pastorContactType?: string;
  pastorMessage?: string;
  
  // Outros
  selectedRegion?: string;
  selectedMinistry?: string;
}

export interface IUserSession extends Document {
  phone: string;
  step: string;
  data: ISessionData;
  previousStep?: string;
  lastInteraction: Date;
  expiresAt: Date;
}

const UserSessionSchema = new Schema<IUserSession>({
  phone: { type: String, required: true, index: true },
  step: { type: String, required: true, default: 'MAIN_MENU' },
  data: { 
    type: Schema.Types.Mixed,
    default: {}
  },
  previousStep: { type: String },
  lastInteraction: { type: Date, default: Date.now },
  expiresAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true
});

// Índices compostos para performance
/*UserSessionSchema.index({ phone: 1, lastInteraction: -1 });
UserSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });*/

export const UserSession = model<IUserSession>('UserSession', UserSessionSchema);