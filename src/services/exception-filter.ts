import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import mongoose from 'mongoose';

@Catch(mongoose.Error.ValidationError)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: mongoose.Error.ValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errors = Object.keys(exception.errors).map((field) => ({
      field,
      message: exception.errors[field].message,
    }));

    response.status(400).json({
      statusCode: 400,
      message: 'Validation failed',
      errors,
    });
  }
}
