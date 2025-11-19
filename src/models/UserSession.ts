import { Schema, model, Document } from "mongoose";

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
  prayerAnonymity?: string; // ✅ ADICIONADO: "1" para Sim, "2" para Não

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

const UserSessionSchema = new Schema<IUserSession>(
  {
    phone: { type: String, required: true, index: true },
    step: { type: String, required: true, default: "WELCOME" },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    previousStep: { type: String },
    lastInteraction: { type: Date, default: Date.now },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
  }
);

export const UserSession = model<IUserSession>(
  "UserSession",
  UserSessionSchema
);
