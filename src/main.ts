import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import swagger from './shared/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  swagger.configure(app);
  await app.listen(3000);
}
bootstrap();
