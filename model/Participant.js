import mongoose from 'mongoose';

const ParticipantSchema = new mongoose.Schema({
  surname: { type: String, required: true, trim: true },
  firstName: { type: String, required: true, trim: true },
  emailAddress: { type: String, required: true, unique: true, lowercase: true },
  whatsAppNumber: { type: String, required: true },
  accountPin: { type: String, required: true }, 

  logistics: {
    travelMode: { type: String, default: "" },
    arrivalDate: { type: String, default: "" },
    specialRequirements: { type: String, default: "" }
  },

  checkout: {
    paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
    transactionId: { type: String, default: "" },
    amountPaid: { type: Number, default: 0 }
  },

  currentStep: { type: Number, enum:, default: 1 }
}, { timestamps: true });

export default mongoose.model('Participant', ParticipantSchema);
