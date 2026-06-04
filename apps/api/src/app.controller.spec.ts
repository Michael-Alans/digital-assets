/**
 * Test suite for the `AppController`.
 * This suite focuses on testing the core functionalities provided by the AppController.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  /**
   * Sets up the testing module and initializes the `AppController` before each test.
   * It creates a testing module with `AppController` and `AppService` to provide the necessary dependencies.
   */
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  /**
   * Test suite for the 'root' path functionality.
   * This suite specifically tests the `getHello` method of the `AppController`.
   */
  describe('root', () => {
    /**
     * Test case to verify that the `getHello` method of `AppController` returns "Hello World!".
     * It asserts the expected string output from the controller's method.
     */
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});