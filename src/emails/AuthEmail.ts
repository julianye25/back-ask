import { transport } from '../config/nodemailer';

interface IEmail {
  email: string;
  username: string;
  token: string;
}

export class AuthEmail {
  static sendConfirmationEmail = async (user: IEmail) => {
    await transport.sendMail({
      from: 'suport@askAcademy.com',
      to: user.email,
      subject: 'Verifica tu cuenta',
      html: `<p>Hola ${user.username}, su token es: ${user.token}</p>`,
    });
  };
}
