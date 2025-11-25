import { NestFactory } from '@nestjs/core';
import { AppModule } from '../modules/app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Coordinator } from '../schema/coordinator.schema';
import { BCRYPT_SALT_ROUNDS, UserRole } from '../common/constants/constants';

async function seedCoordinator() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const coordinatorModel = app.get<Model<Coordinator>>(getModelToken(Coordinator.name));

  try {
    const existingCoordinator = await coordinatorModel.findOne({ 
      email: 'coordinator@university.edu' 
    });

    if (existingCoordinator) {
      console.log('✅ Coordinator already exists');
      console.log('Email:', existingCoordinator.email);
      console.log('Coordinator ID:', existingCoordinator.coordinatorId);
      await app.close();
      return;
    }

    const hashedPassword = await bcrypt.hash('Coordinator@123', BCRYPT_SALT_ROUNDS);

    const coordinator = new coordinatorModel({
      firstName: 'System',
      lastName: 'Coordinator',
      email: 'coordinator@university.edu',
      password: hashedPassword,
      role: UserRole.COORDINATOR,
      coordinatorId: 'COORD-001',
      department: 'Computer Science',
      designation: 'FYP Coordinator',
      phoneNumber: '03001234567',
    });

    await coordinator.save();

    console.log('✅ Coordinator created successfully!');
    console.log('=====================================');
    console.log('Email: coordinator@university.edu');
    console.log('Password: Coordinator@123');
    console.log('Coordinator ID:', coordinator.coordinatorId);
    console.log('=====================================');

  } catch (error) {
    console.error('❌ Error creating coordinator:', error);
  }

  await app.close();
}

seedCoordinator();