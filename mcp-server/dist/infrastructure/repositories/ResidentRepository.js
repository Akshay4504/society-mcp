import { Resident } from '../../models/Resident.js';
export class ResidentRepository {
    async findByUnit(block, flatNumber) {
        return Resident.findOne({
            block: block.toUpperCase(),
            flatNumber: flatNumber.toUpperCase()
        }).populate('userId', 'firstName lastName email phone');
    }
    async findById(id) {
        return Resident.findById(id).populate('userId', 'firstName lastName email phone');
    }
    async findAll() {
        return Resident.find().populate('userId', 'firstName lastName email phone');
    }
}
//# sourceMappingURL=ResidentRepository.js.map