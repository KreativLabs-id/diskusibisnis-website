import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { validationErrorResponse } from './response.utils';

export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', JSON.stringify(errors.array(), null, 2));
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    validationErrorResponse(res, 'Validation error', errors.array());
    return;
  }
  next();
};
