import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { body } from 'express-validator';
import { handleInputErrors } from '../middlewares/validation';

const router = Router();

router.post(
  '/create-account',
  body('username').notEmpty().withMessage('El nombre es requerido'),
  body('email').isEmail().withMessage('Debe ser un email valido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('la contraseña debe tener al menos 6 caracteres'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('las contraseñas no coinciden');
    }
    return true;
  }),
  handleInputErrors,
  AuthController.createAccount,
);

router.post(
  '/confirm-account',
  body('token').notEmpty().withMessage('El token es requerido'),
  handleInputErrors,
  AuthController.confirmAccount,
);

router.post(
  '/login',
  body('email').isEmail().withMessage('Debe ser un email valido'),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
  handleInputErrors,
  AuthController.login,
);

export default router;
