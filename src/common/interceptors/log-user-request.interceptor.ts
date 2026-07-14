import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import type { Request } from 'express';

@Injectable()
export class LogUserRequestInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LogUserRequestInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const route = `${request.method} ${request.path}`;

    this.logger.log(`[UserRequest] route=${route}`);

    return next.handle();
  }
}
