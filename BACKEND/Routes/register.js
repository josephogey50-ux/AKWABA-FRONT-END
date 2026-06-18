import express from 'express';
import bcrypt from 'bcrypt';
import Participant from '../models/Participant.js';

const router = express.Router();

router.post('/register/step', async (req, res) => {
  const { step, emailAddress, ...incomingData } = req.body;

  // ── Guard: email is required ──
  if (!emailAddress) {
    return res.status(400).json({ error: "Email address is required to track progress." });
  }

  // ── Guard: step must be a valid number ──
  const currentStepNum = parseInt(step);
  if (!step || isNaN(currentStepNum)) {
    return res.status(400).json({ error: "Valid step number is required." });
  }

  try {

    // ════════════════════════════════
    // STEP 1 — Profile Creation
    // ════════════════════════════════
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

    // ════════════════════════════════
    // STEPS 2 & 3 — Lookup participant first
    // ════════════════════════════════
    const participant = await Participant.findOne({ emailAddress: emailAddress.toLowerCase() });

    if (!participant) {
      return res.status(404).json({ error: "Registration session not found. Please restart from Step 1." });
    }

    // ── Guard: prevent skipping steps ──
    if (participant.currentStep < currentStepNum) {
      return res.status(400).json({ error: `Please complete Step ${participant.currentStep} before proceeding to Step ${currentStepNum}.` });
    }

    let updatePayload = {};

    // ════════════════════════════════
    // STEP 2 — Logistics
    // ════════════════════════════════
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

    // ════════════════════════════════
    // STEP 3 — Checkout
    // ════════════════════════════════
    else if (currentStepNum === 3) {
      updatePayload = {
        $set: {
          'checkout.paymentStatus': incomingData.paymentStatus || 'Completed',
          'checkout.transactionId': incomingData.transactionId,
          'checkout.amountPaid': incomingData.amountPaid,
          currentStep: 4  // ← FIXED: was incorrectly set to 3 (never advanced)
        }
      };
    }

    else {
      return res.status(400).json({ error: "Invalid step number. Expected 1, 2, or 3." });
    }

    const updatedParticipant = await Participant.findOneAndUpdate(
      { emailAddress: emailAddress.toLowerCase() },
      updatePayload,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: `Step ${currentStepNum} successfully saved.`,
      nextStep: updatedParticipant.currentStep
    });

  } catch (error) {
    // ── In production: remove `details` to avoid leaking internal errors ──
    const isDev = process.env.NODE_ENV !== 'production';
    res.status(500).json({
      error: "Internal Server Error",
      ...(isDev && { details: error.message })
    });
  }
});

export default router;