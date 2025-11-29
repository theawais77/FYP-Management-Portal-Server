import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/constants/constants';
import { GroupService } from 'src/services/group/group.service';
import { CreateGroupDto, AddMemberDto } from 'src/dto/student.dto';

@ApiTags('Groups')
@Controller('groups')
@ApiBearerAuth()
@Roles(UserRole.STUDENT)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new group (Student becomes leader)' })
  async createGroup(
    @CurrentUser('userId') studentId: string,
    @Body() dto: CreateGroupDto,
  ) {
    return this.groupService.createGroup(studentId, dto);
  }

  @Put(':groupId/add-member')
  @ApiOperation({ summary: 'Add member to group (Leader only)' })
  async addMember(
    @Param('groupId') groupId: string,
    @CurrentUser('userId') leaderId: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.groupService.addMember(groupId, leaderId, dto);
  }

  @Put(':groupId/remove-member/:memberId')
  @ApiOperation({ summary: 'Remove member from group (Leader only)' })
  async removeMember(
    @Param('groupId') groupId: string,
    @Param('memberId') memberId: string,
    @CurrentUser('userId') leaderId: string,
  ) {
    return this.groupService.removeMember(groupId, leaderId, memberId);
  }

  @Put(':groupId/leave')
  @ApiOperation({ summary: 'Leave group (Members only, not leader)' })
  async leaveGroup(
    @Param('groupId') groupId: string,
    @CurrentUser('userId') studentId: string,
  ) {
    return this.groupService.leaveGroup(groupId, studentId);
  }

  @Get('my-group')
  @ApiOperation({ summary: 'Get own group details' })
  async getMyGroup(@CurrentUser('userId') studentId: string) {
    return this.groupService.getMyGroup(studentId);
  }
}
