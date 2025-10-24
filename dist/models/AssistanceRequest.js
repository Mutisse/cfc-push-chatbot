"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssistanceRequest = void 0;
const mongoose_1 = require("mongoose");
const AssistanceRequestSchema = new mongoose_1.Schema({
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
exports.AssistanceRequest = (0, mongoose_1.model)('AssistanceRequest', AssistanceRequestSchema);
