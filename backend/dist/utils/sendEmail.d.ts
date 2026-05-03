interface EmailOptions {
    email: string;
    subject: string;
    html: string;
    text?: string;
    attachments?: {
        filename: string;
        content: Buffer | string;
        cid?: string;
    }[];
}
declare const sendEmail: (options: EmailOptions) => Promise<void>;
export default sendEmail;
//# sourceMappingURL=sendEmail.d.ts.map