import { ISociety } from '../../models/Society.js';

export interface ISocietyRepository {
  findFirst(): Promise<ISociety | null>;
}
