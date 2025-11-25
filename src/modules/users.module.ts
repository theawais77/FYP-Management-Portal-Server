import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Coordinator, CoordinatorSchema } from 'src/schema/coordinator.schema';
import { Student, StudentSchema } from 'src/schema/student.schema';
import { Supervisor, SupervisorSchema } from 'src/schema/supervisor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Student.name, schema: StudentSchema },
      { name: Supervisor.name, schema: SupervisorSchema },
      { name: Coordinator.name, schema: CoordinatorSchema },
    ]),
  ],
  controllers: [],
  providers: [],
})
export class UsersModule {}
