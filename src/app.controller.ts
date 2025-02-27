import { SuccessResponseObject } from '@common/utils/http';
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  root() {
    return new SuccessResponseObject('server up', null);
  }
}
