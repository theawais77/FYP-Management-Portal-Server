import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from '../schema/project.schema';
import { ProjectIdea, ProjectIdeaSchema } from '../schema/project-idea.schema';
import { Group, GroupSchema } from '../schema/group.schema';
import { ProjectController } from '../controllers/student/project.controller';
import { ProjectService } from '../services/project/project.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: ProjectIdea.name, schema: ProjectIdeaSchema },
      { name: Group.name, schema: GroupSchema },
    ]),
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
