import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    description: String
}, { timestamps: true });

const Setting = mongoose.model('Setting', SettingSchema);
export default Setting;
