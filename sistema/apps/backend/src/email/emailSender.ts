import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";
import { ValidationError } from "../errors.js";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}

type Provider = "sendgrid" | "maildev";

let sendGridConfigured = false;
let maildevTransport: nodemailer.Transporter | null = null;

const getProvider = (): Provider => {
  const provider = (process.env.EMAIL_PROVIDER ?? "sendgrid").toLowerCase();
  if (provider === "maildev" || provider === "sendgrid") {
    return provider;
  }
  throw new ValidationError(
    "EMAIL_PROVIDER must be either 'sendgrid' or 'maildev'."
  );
};

const getMaildevFrom = () => {
  const from = process.env.MAILDEV_FROM ?? process.env.EMAIL_FROM;
  if (!from) {
    throw new ValidationError(
      "MAILDEV_FROM (or EMAIL_FROM) is required to send emails via MailDev."
    );
  }
  return from;
};

const getMaildevTransport = () => {
  if (maildevTransport) {
    return maildevTransport;
  }
  const host = process.env.MAILDEV_HOST ?? "localhost";
  const port = Number(process.env.MAILDEV_PORT ?? "1025");
  if (Number.isNaN(port)) {
    throw new ValidationError("MAILDEV_PORT must be a valid number.");
  }

  maildevTransport = nodemailer.createTransport({
    host,
    port,
    secure: false,
    ignoreTLS: true
  });

  return maildevTransport;
};

const configureSendGrid = () => {
  if (sendGridConfigured) {
    return;
  }
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    throw new ValidationError("SENDGRID_API_KEY is required to send emails.");
  }
  sgMail.setApiKey(apiKey);
  sendGridConfigured = true;
};

const getSendGridFrom = () => {
  const from = process.env.SENDGRID_FROM;
  if (!from) {
    throw new ValidationError("SENDGRID_FROM is required to send emails.");
  }
  return from;
};

export const emailSender = {
  async sendEmail(message: EmailMessage) {
    const provider = getProvider();
    if (provider === "maildev") {
      const transport = getMaildevTransport();
      await transport.sendMail({
        from: getMaildevFrom(),
        to: message.to,
        subject: message.subject,
        text: message.text
      });
      return;
    }

    configureSendGrid();
    await sgMail.send({
      from: getSendGridFrom(),
      to: message.to,
      subject: message.subject,
      text: message.text
    });
  }
};
