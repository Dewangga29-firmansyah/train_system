import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { KeretaModule } from './kereta/kereta.module';
import { JadwalModule } from './jadwal/jadwal.module';
import { PaymentModule } from './payment/payment.module';
import { PembelianModule } from './pembelian/pembelian.module';
import { PelangganModule } from './pelanggan/pelanggan.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
    }),

    AuthModule,
    PrismaModule,
    UsersModule,
    KeretaModule,
    JadwalModule,
    PaymentModule,
    PembelianModule,
    PelangganModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
