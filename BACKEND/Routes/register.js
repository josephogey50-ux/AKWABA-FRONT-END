import express from 'express';
import bcrypt from 'bcrypt';
import Participant from '../models/Participant.js';

const router = express.Router();

router.post('/register/step', async (req, res) => {
  const { step, emailAddress, ...incomingData } = req.body;

  if (!emailAddress) {
    return res.status(400).json({ error: "Email address is required to track progress." });
  }

  try {
    const currentStepNum = parseInt(step);

    if (currentStepNum === 1) {
      const existingUser = await Participant.findOne({ emailAddress: emailAddress.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ error: "An account with this email already exists." });
      }

      const hashedPin = await bcrypt.hash(incomingData.accountPin, 10);

      const newParticipant = new Participant({
        surname: incomingData.surname,
        firstName: incomingData.firstName,
        emailAddress: emailAddress.toLowerCase(),
        whatsAppNumber: incomingData.whatsAppNumber,
        accountPin: hashedPin,
        currentStep: 2
      });

      await newParticipant.save();
      return res.status(201).json({ message: 'Profile created!', nextStep: 2 });
    }

    let updatePayload = {};

    if (currentStepNum === 2) {
      updatePayload = {
        $set: {
          'logistics.travelMode': incomingData.travelMode || incomingData.logistics?.travelMode,
          'logistics.arrivalDate': incomingData.arrivalDate || incomingData.logistics?.arrivalDate,
          'logistics.specialRequirements': incomingData.specialRequirements || incomingData.logistics?.specialRequirements,
          currentStep: 3 
        }
      };
    } 
    else if (currentStepNum === 3) {
      updatePayload = {
        $set: {
          'checkout.paymentStatus': incomingData.paymentStatus || 'Completed',
          'checkout.transactionId': incomingData.transactionId,
          'checkout.amountPaid': incomingData.amountPaid,
          currentStep: 3 
        }
      };
    }

    const updatedParticipant = await Participant.findOneAndUpdate(
      { emailAddress: emailAddress.toLowerCase() },
      updatePayload,
      { new: true, runValidators: true }
    );

    if (!updatedParticipant) {
      return res.status(404).json({ error: "Registration session not found. Please restart from Step 1." });
    }

    res.status(200).json({ 
      message: `Segment ${currentStepNum} successfully saved.`, 
      nextStep: updatedParticipant.currentStep 
    });

  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

export default router;
