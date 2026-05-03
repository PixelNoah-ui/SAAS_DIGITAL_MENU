import nodemailer from "nodemailer";
const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_HOST,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
    const mailOptions = {
        from: `PixelHotel Digital Menu <${process.env.EMAIL_USERNAME}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments || [],
    };
    await transporter.sendMail(mailOptions);
};
export default sendEmail;
//# sourceMappingURL=sendEmail.js.map