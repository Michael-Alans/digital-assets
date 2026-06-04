import { Injectable } from '@nestjs/common';

/**
 * Service responsible for handling core application logic.
 */
@Injectable()
export class AppService {
  /**
   * Returns a simple greeting message.
   * @returns A string containing "Hello World!".
   */
  getHello(): string {
    return 'Hello World!';
  }
}