import { ISocietyRepository } from '../../domain/repositories/SocietyRepository.interface.js';
import { ISociety } from '../../models/Society.js';
export declare class SocietyRepository implements ISocietyRepository {
    findFirst(): Promise<ISociety | null>;
}
