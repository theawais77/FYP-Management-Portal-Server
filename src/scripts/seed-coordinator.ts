import { NestFactory } from '@nestjs/core';
import { AppModule } from '../modules/app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Coordinator } from '../schema/coordinator.schema';
import { Department } from '../schema/department.schema';
import { BCRYPT_SALT_ROUNDS, UserRole } from '../common/constants/constants';

async function seedCoordinator() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const coordinatorModel = app.get<Model<Coordinator>>(getModelToken(Coordinator.name));
  const departmentModel = app.get<Model<Department>>(getModelToken(Department.name));

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

    // Find or create Computer Science department
    let department = await departmentModel.findOne({ code: 'CS' });
    if (!department) {
      department = await departmentModel.create({
        name: 'Computer Science',
        code: 'CS',
        description: 'Department of Computer Science',
      });
      console.log('✅ Computer Science department created');
    }

    const hashedPassword = await bcrypt.hash('Coordinator@123', BCRYPT_SALT_ROUNDS);

    const coordinator = new coordinatorModel({
      firstName: 'System',
      lastName: 'Coordinator',
      email: 'coordinator@university.edu',
      password: hashedPassword,
      role: UserRole.COORDINATOR,
      coordinatorId: 'COORD-001',
      department: department._id,
      designation: 'FYP Coordinator',
      phoneNumber: '03001234567',
    });

    await coordinator.save();

    // Update department with coordinator reference
    await departmentModel.findByIdAndUpdate(department._id, {
      coordinator: coordinator._id,
    });

    console.log('✅ Coordinator created successfully!');
    console.log('=====================================');
    console.log('Email: coordinator@university.edu');
    console.log('Password: Coordinator@123');
    console.log('Coordinator ID:', coordinator.coordinatorId);
    console.log('Department:', department.name);
    console.log('=====================================');

  } catch (error) {
    console.error('❌ Error creating coordinator:', error);
  }

  await app.close();
}

seedCoordinator();