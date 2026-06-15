import { IResidentRepository } from '../../domain/repositories/ResidentRepository.interface.js';
import { Resident, IResident } from '../../models/Resident.js';

export class ResidentRepository implements IResidentRepository {
  async findByUnit(block: string, flatNumber: string): Promise<IResident | null> {
    return Resident.findOne({
      block: block.toUpperCase(),
      flatNumber: flatNumber.toUpperCase()
    }).populate('userId', 'firstName lastName email phone');
  }

  async findById(id: string): Promise<IResident | null> {
    return Resident.findById(id).populate('userId', 'firstName lastName email phone');
  }

  async findAll(): Promise<IResident[]> {
    return Resident.find().populate('userId', 'firstName lastName email phone');
  }
}
