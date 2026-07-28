import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './common/configs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProviderModule } from './provider/provider.module';
import { MailModule } from './mail/mail.module';
import { ApplicationsModule } from './applications/applications.module';
import { MailAccountsModule } from './mail-accounts/mail-accounts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('mongo.uri'),
        dbName: config.get<string>('mongo.dbName'),
        lazyConnection: process.env.VERCEL === '1',
      }),
    }),
    ProviderModule,
    ApplicationsModule,
    MailAccountsModule,
    MailModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
