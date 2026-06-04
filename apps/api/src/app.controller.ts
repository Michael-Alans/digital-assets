/**
 * Controller for handling application-level requests.
 * @class
 */
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Handles GET requests to the root path and returns a welcome message.
   * @returns {string} A welcome string from the AppService.
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}