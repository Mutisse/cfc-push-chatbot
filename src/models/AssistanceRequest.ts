import { Schema, model, Document } from 'mongoose';

export interface IAssistanceRequest extends Document {
  userPhone: string;
  userName: string;
  type: 'assistencia_alimentar' | 'assistencia_medica' | 'assistencia_juridica' | 'assistencia_outra';
  description: string;
  status: 'pendente' | 'em_analise' | 'atendido' | 'rejeitado';
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  createdAt: Date;
  updatedAt: Date;
}

const AssistanceRequestSchema = new Schema<IAssistanceRequest>({
  userPhone: { 
    type: String, 
    required: true,
    index: true
  },
  userName: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['assistencia_alimentar', 'assistencia_medica', 'assistencia_juridica', 'assistencia_outra'],
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pendente', 'em_analise', 'atendido', 'rejeitado'],
    default: 'pendente',
    index: true
  },
  priority: { 
    type: String, 
    enum: ['baixa', 'media', 'alta', 'urgente'],
    default: 'media',
    index: true
  }
}, {
  timestamps: true
});

export const AssistanceRequest = model<IAssistanceRequest>('AssistanceRequest', AssistanceRequestSchema);