// Mock email functionality since we're not using email notifications
const sendEmail = async ({ to, subject, text }) => {
  console.log('Email sending is disabled');
  return true;
};

module.exports = sendEmail;
