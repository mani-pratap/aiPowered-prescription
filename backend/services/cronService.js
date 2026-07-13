import cron from 'node-cron';
import User from '../models/User.js';
import { sendPillReminderEmail } from '../utils/emailService.js';

export const startCronJobs = () => {
  console.log('⏰ Initializing Pill Reminder Cron Engine...');

  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      // Get current time in HH:mm format, using local time
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${hours}:${minutes}`;

      console.log(`[Cron] Checking for pill reminders at ${currentTime}...`);

      // Find users who have active medicines scheduled for this exact minute
      // Since reminderTimes is inside an array of objects, we can query the users first
      // Or we can just find users who are regular patients and have medicine schedules
      const users = await User.find({
        patientType: 'regular',
        'medicineSchedule.status': 'active',
        'medicineSchedule.dailyReminderEnabled': true,
        'medicineSchedule.reminderTimes': currentTime
      });

      if (users.length === 0) {
        return; // No reminders for this minute
      }

      console.log(`[Cron] Found ${users.length} users with reminders for ${currentTime}.`);

      for (const user of users) {
        // Filter out only the medicines that are scheduled for NOW
        const dueMedicines = user.medicineSchedule.filter(med => 
          med.status === 'active' && 
          med.dailyReminderEnabled === true && 
          med.reminderTimes && 
          med.reminderTimes.includes(currentTime)
        );

        if (dueMedicines.length > 0) {
          await sendPillReminderEmail(user, dueMedicines, currentTime);
        }
      }

    } catch (error) {
      console.error('[Cron Error] Failed to process pill reminders:', error);
    }
  });

  console.log('✅ Cron Engine Started (Running every minute)');
};
