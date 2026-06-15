import { ISocietyRepository } from '../../domain/repositories/SocietyRepository.interface.js';
import { Society, ISociety } from '../../models/Society.js';

export class SocietyRepository implements ISocietyRepository {
  async findFirst(): Promise<ISociety | null> {
    return Society.findOne();
  }
}
