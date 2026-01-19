import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SettingsController } from './settings.controller'
import { SettingsService } from './settings.service'
import { Branch } from './entities/branch.entity'
import { Unit } from './entities/unit.entity'
import { Attribute } from './entities/attribute.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Branch, Unit, Attribute])],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}





