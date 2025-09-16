// functions/src/index.ts

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Export a function that triggers when data is created or updated at /blumie
export const monitorMoodForAlerts = functions.database.ref('/blumie')
    .onUpdate(async (change, context) => {
        const beforeData = change.before.val(); // Data before the update
        const afterData = change.after.val();   // Data after the update

        // Log the data for debugging
        functions.logger.info("Mood data updated:", { before: beforeData, after: afterData });

        // Extract the mood_name (text description)
        const newMoodDescription = afterData.mood_name;

        if (newMoodDescription) {
            // Here's where you'll add your logic to check for danger signs
            // For now, let's just log it.
            functions.logger.info("New mood description received:", newMoodDescription);

            // --- Placeholder for your alert logic ---
            // In the next steps, you'll replace this with actual checks
            // and SMS sending.
            const concerningKeywords = ["sad", "alone", "struggling", "anxious"]; // Example keywords

            const isConcerning = concerningKeywords.some(keyword =>
                newMoodDescription.toLowerCase().includes(keyword)
            );

            if (isConcerning) {
                functions.logger.warn("Potentially concerning mood detected:", { mood: newMoodDescription, student: afterData.student_id });
                // THIS IS WHERE YOU'LL SEND THE SMS ALERT!
                // (We'll cover SMS integration in a follow-up)
            }
            // --- End Placeholder ---

        } else {
            functions.logger.warn("No mood_name found in the update.");
        }

        return null; // Cloud Functions should always return null or a Promise
    });

// You can remove or comment out the example 'helloWorld' function if it was generated.
