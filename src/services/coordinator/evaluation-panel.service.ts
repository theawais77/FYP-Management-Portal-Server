import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EvaluationPanel, EvaluationPanelDocument } from 'src/schema/evaluation-panel.schema';
import { Supervisor, SupervisorDocument } from 'src/schema/supervisor.schema';
import { CreatePanelDto, UpdatePanelDto } from 'src/dto/coordinator.dto';

@Injectable()
export class EvaluationPanelService {
  constructor(
    @InjectModel(EvaluationPanel.name) private panelModel: Model<EvaluationPanelDocument>,
    @InjectModel(Supervisor.name) private supervisorModel: Model<SupervisorDocument>,
  ) {}

  async create(dto: CreatePanelDto, coordinatorId: string) {
    // Validate all members exist and are supervisors
    const members = await this.supervisorModel.find({
      _id: { $in: dto.members },
    });

    if (members.length !== dto.members.length) {
      throw new BadRequestException('One or more faculty members not found');
    }

    // Check if all members are from the same department
    const invalidMembers = members.filter(m => m.department !== dto.department);
    if (invalidMembers.length > 0) {
      throw new BadRequestException(`All panel members must be from ${dto.department} department`);
    }

    const panel = await this.panelModel.create({
      ...dto,
      members: dto.members,
      createdBy: coordinatorId,
    });

    const populatedPanel = await this.panelModel
      .findById(panel._id)
      .populate('members', 'firstName lastName email designation department')
      .populate('createdBy', 'firstName lastName email');

    return {
      message: 'Evaluation panel created successfully',
      panel: populatedPanel,
    };
  }

  async findAll(department?: string) {
    const query: any = {};
    if (department) {
      query.department = department;
    }

    const panels = await this.panelModel
      .find(query)
      .populate('members', 'firstName lastName email designation department')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    return panels;
  }

  async findOne(id: string) {
    const panel = await this.panelModel
      .findById(id)
      .populate('members', 'firstName lastName email designation department specialization')
      .populate('createdBy', 'firstName lastName email');

    if (!panel) {
      throw new NotFoundException('Evaluation panel not found');
    }

    return panel;
  }

  async update(id: string, dto: UpdatePanelDto) {
    const panel = await this.panelModel.findById(id);

    if (!panel) {
      throw new NotFoundException('Evaluation panel not found');
    }

    // If updating members, validate they exist
    if (dto.members) {
      const members = await this.supervisorModel.find({
        _id: { $in: dto.members },
      });

      if (members.length !== dto.members.length) {
        throw new BadRequestException('One or more faculty members not found');
      }

      // Check if all members are from the same department as panel
      const invalidMembers = members.filter(m => m.department !== panel.department);
      if (invalidMembers.length > 0) {
        throw new BadRequestException(`All panel members must be from ${panel.department} department`);
      }
    }

    await this.panelModel.findByIdAndUpdate(id, dto, { runValidators: true });

    const updatedPanel = await this.panelModel
      .findById(id)
      .populate('members', 'firstName lastName email designation department')
      .populate('createdBy', 'firstName lastName email');

    return {
      message: 'Evaluation panel updated successfully',
      panel: updatedPanel,
    };
  }

  async remove(id: string) {
    const panel = await this.panelModel.findById(id);

    if (!panel) {
      throw new NotFoundException('Evaluation panel not found');
    }

    // You might want to check if panel is assigned to any schedules
    // For now, we'll allow deletion

    await this.panelModel.findByIdAndDelete(id);

    return {
      message: 'Evaluation panel deleted successfully',
    };
  }
}
