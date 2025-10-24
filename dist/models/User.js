"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
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
exports.User = (0, mongoose_1.model)('User', UserSchema);
