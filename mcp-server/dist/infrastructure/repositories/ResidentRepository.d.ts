import { IResidentRepository } from '../../domain/repositories/ResidentRepository.interface.js';
import { IResident } from '../../models/Resident.js';
export declare class ResidentRepository implements IResidentRepository {
    findByUnit(block: string, flatNumber: string): Promise<IResident | null>;
    findById(id: string): Promise<IResident | null>;
    findAll(): Promise<IResident[]>;
}
