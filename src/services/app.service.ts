import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor() { }

  async healthCheck() {
    return {"status": "ok"};
  }
}
