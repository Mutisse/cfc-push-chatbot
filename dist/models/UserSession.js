"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSession = void 0;
const mongoose_1 = require("mongoose");
const UserSessionSchema = new mongoose_1.Schema({
    phone: { type: String, required: true, index: true },
    step: { type: String, required: true, default: 'MAIN_MENU' },
    data: {
        type: mongoose_1.Schema.Types.Mixed,
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
exports.UserSession = (0, mongoose_1.model)('UserSession', UserSessionSchema);
