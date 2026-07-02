import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import fs = require('fs');
import path = require('path');

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : String(exception);

    const logPath = path.join(process.cwd(), 'backend-errors.log');
    const timestamp = new Date().toISOString();
    
    // Log format terperinci
    const logMessage = `[${timestamp}] Exception on ${request.method} ${request.url}\n` +
                       `  Status: ${status}\n` +
                       `  Token: ${request.headers.authorization || 'No Token'}\n` +
                       `  Body: ${JSON.stringify(request.body)}\n` +
                       `  Response: ${JSON.stringify(errorResponse)}\n` +
                       `  Stack: ${exception instanceof Error ? exception.stack : 'No Stack'}\n\n`;
    
    try {
      fs.appendFileSync(logPath, logMessage);
    } catch (e) {
      // ignore
    }

    // Teruskan respon HTTP standar ke frontend
    response.status(status).json(
      exception instanceof HttpException
        ? exception.getResponse()
        : { statusCode: status, message: 'Internal server error' }
    );
  }
}
