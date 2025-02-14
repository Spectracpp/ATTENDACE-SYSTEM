const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Send invitation email
exports.sendInvitationEmail = async (email, { organizationName, role, invitationToken, invitedBy }) => {
    const invitationUrl = `${process.env.FRONTEND_URL}/join-organization/${invitationToken}`;

    const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: email,
        subject: `Invitation to join ${organizationName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>You've been invited to join ${organizationName}</h2>
                <p>Hello,</p>
                <p>${invitedBy} has invited you to join ${organizationName} as a ${role}.</p>
                <p>Click the button below to accept the invitation:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${invitationUrl}" 
                       style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 4px; display: inline-block;">
                        Accept Invitation
                    </a>
                </div>
                <p>Or copy and paste this link in your browser:</p>
                <p>${invitationUrl}</p>
                <p>This invitation will expire in 7 days.</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 12px;">
                    If you didn't expect this invitation, you can safely ignore this email.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending invitation email:', error);
        throw new Error('Failed to send invitation email');
    }
};

// Send welcome email after joining organization
exports.sendWelcomeEmail = async (email, { organizationName, role, firstName }) => {
    const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: email,
        subject: `Welcome to ${organizationName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Welcome to ${organizationName}!</h2>
                <p>Hello ${firstName},</p>
                <p>You have successfully joined ${organizationName} as a ${role}.</p>
                <p>You can now:</p>
                <ul>
                    ${role === 'student' || role === 'employee' ? `
                        <li>Mark your attendance using QR codes</li>
                        <li>View your attendance history</li>
                        <li>Update your profile information</li>
                    ` : role === 'teacher' ? `
                        <li>Create attendance sessions</li>
                        <li>Monitor student attendance</li>
                        <li>Generate attendance reports</li>
                    ` : `
                        <li>Manage organization settings</li>
                        <li>Invite new members</li>
                        <li>View comprehensive reports</li>
                    `}
                </ul>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL}/dashboard" 
                       style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 4px; display: inline-block;">
                        Go to Dashboard
                    </a>
                </div>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 12px;">
                    Need help? Contact our support team at ${process.env.SUPPORT_EMAIL}
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending welcome email:', error);
        throw new Error('Failed to send welcome email');
    }
};
