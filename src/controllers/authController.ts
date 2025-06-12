import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import User from '../models/User';
import { hashPassword, comparePassword } from '../utils/auth';
import Token from '../models/Token';
import { generateToken } from '../utils/token';
import { AuthEmail } from '../emails/AuthEmail';
import { log } from 'console';

export class AuthController {
  static createAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      log('req.body', req.body);

      // Prevenir duplicados
      const userExists = await User.findOne({ email });

      if (userExists) {
        res.status(400).json({
          error: 'El usuario ya existe',
        });
        return;
      }
      const user = new User(req.body);

      user.password = await hashPassword(req.body.password);

      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      AuthEmail.sendConfirmationEmail({
        email: user.email,
        username: user.username,
        token: token.token,
      });

      await Promise.allSettled([token.save(), user.save()]);

      res.json('Cuenta creada, revisa tu correo para activar tu cuenta');
    } catch (error) {
      res.status(500).json({
        error: error,
      });
    }
  };

  static confirmAccount = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const { token } = req.body;

      // Verificar si el token existe
      const tokenExists = await Token.findOne({
        token,
      });

      if (!tokenExists) {
        res.status(400).json({
          error: 'Token no valido',
        });
        return;
      }

      const user = await User.findById(tokenExists.user);
      user.confirmed = true;

      await Promise.allSettled([user.save(), Token.deleteOne()]);
      res.json('Cuenta activada correctamente');

      console.log('tokenExists', tokenExists);
    } catch (error) {
      res.status(500).json({
        error: error,
      });
    }
  };

  static login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Verificar si el usuario existe
      const user = await User.findOne({ email });

      if (!user) {
        res.status(400).json({
          error: 'El usuario no existe',
        });
        return;
      }

      if (!user.confirmed) {
        // Si el usuario no ha confirmado su cuenta
        const token = new Token();
        token.user = user.id;
        token.token = generateToken();
        await token.save();

        AuthEmail.sendConfirmationEmail({
          email: user.email,
          username: user.username,
          token: token.token,
        });

        res.status(400).json({
          error:
            'El usuario no ha sido confirmado, se ha enviado un nuevo token a su correo',
        });
        return;
      }

      // Verificar la contraseña
      const isPasswordCorrect = await comparePassword(password, user.password);

      if (!isPasswordCorrect) {
        res.status(400).json({
          error: 'El correo o la contraseña son incorrectos',
        });
        return;
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'secreto', // Usa tu secreto real
        { expiresIn: '1d' },
      );

      res.json({
        message: 'Inicio de sesión exitoso',
        token, // <-- Aquí envías el token
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          confirmed: user.confirmed,
        },
      });
    } catch (error) {
      res.status(500).json({
        error: error,
      });
    }
  };
}
