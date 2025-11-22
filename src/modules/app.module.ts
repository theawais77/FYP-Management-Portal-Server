import { Module } from '@nestjs/common';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../services/app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/schema/user.schema';

@Module({
  imports: [ConfigModule.forRoot({
    envFilePath: '.env',
    isGlobal: true,
  }),
  MongooseModule.forRoot(process.env.CONNECTION_STRING!),
  MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
],
  
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
