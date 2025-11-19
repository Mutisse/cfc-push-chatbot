"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrayerRequest = void 0;
const mongoose_1 = require("mongoose");
const PrayerRequestSchema = new mongoose_1.Schema({
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
exports.PrayerRequest = (0, mongoose_1.model)('PrayerRequest', PrayerRequestSchema);
