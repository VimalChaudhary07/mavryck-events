import { toast } from 'react-hot-toast';

interface EventDetails {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  date: string;
  guestCount: string;
  requirements: string;
}

interface NotificationParams {
  customerEmail: string;
  eventDetails: EventDetails;
}

export async function sendEventNotification({
  customerEmail,
  eventDetails,
}: NotificationParams) {
  const emailSubject = 'New Event Planning Request Submitted';
  const emailBody = `
Hello,

A new event planning request has been submitted. Here are the details:

Event Details:
- Name: ${eventDetails.name}
- Email: ${customerEmail}
- Phone: ${eventDetails.phone}
- Event Type: ${eventDetails.eventType}
- Date: ${eventDetails.date}
- Number of Guests: ${eventDetails.guestCount}
- Special Requirements: ${eventDetails.requirements}

Please log into the admin panel to review and manage this entry.

Thank you,
Event Planning Team
  `;

  try {
    // In a real application, you would integrate with an email service here
    // For demo purposes, we'll simulate sending an email
    console.log('Sending email notification to:', 'festive.fitness.events@gmail.com');
    console.log('Subject:', emailSubject);
    console.log('Body:', emailBody);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Event request notification sent successfully');
    return true;
  } catch (error) {
    console.error('Failed to send email notification:', error);
    toast.error('Failed to send event notification');
    return false;
  }
}