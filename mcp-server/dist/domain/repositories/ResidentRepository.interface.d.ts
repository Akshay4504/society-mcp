import { IResident } from '../../models/Resident.js';
export interface IResidentRepository {
    findByUnit(block: string, flatNumber: string): Promise<IResident | null>;
    findById(id: string): Promise<IResident | null>;
    findAll(): Promise<IResident[]>;
}
