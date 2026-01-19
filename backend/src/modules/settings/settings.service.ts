import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Branch } from './entities/branch.entity'
import { Unit } from './entities/unit.entity'
import { Attribute } from './entities/attribute.entity'

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
    @InjectRepository(Attribute)
    private readonly attributeRepository: Repository<Attribute>,
  ) {}

  // ================== BRANCHES ==================
  async getAllBranches() {
    return this.branchRepository.find({
      order: { sortOrder: 'ASC', name: 'ASC' },
    })
  }

  async createBranch(data: Partial<Branch>) {
    const branch = this.branchRepository.create(data)
    return this.branchRepository.save(branch)
  }

  async updateBranch(id: number, data: Partial<Branch>) {
    const branch = await this.branchRepository.findOne({ where: { id } })
    if (!branch) {
      throw new NotFoundException('Không tìm thấy chi nhánh')
    }
    Object.assign(branch, data)
    return this.branchRepository.save(branch)
  }

  async deleteBranch(id: number) {
    const branch = await this.branchRepository.findOne({ where: { id } })
    if (!branch) {
      throw new NotFoundException('Không tìm thấy chi nhánh')
    }
    if (branch.isDefault) {
      throw new ConflictException('Không thể xóa chi nhánh mặc định')
    }
    await this.branchRepository.softDelete(id)
    return { message: 'Đã xóa chi nhánh' }
  }

  // ================== UNITS ==================
  async getAllUnits() {
    return this.unitRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    })
  }

  async createUnit(data: Partial<Unit>) {
    const existing = await this.unitRepository.findOne({ where: { name: data.name } })
    if (existing) {
      throw new ConflictException('Đơn vị này đã tồn tại')
    }
    const unit = this.unitRepository.create(data)
    return this.unitRepository.save(unit)
  }

  async updateUnit(id: number, data: Partial<Unit>) {
    const unit = await this.unitRepository.findOne({ where: { id } })
    if (!unit) {
      throw new NotFoundException('Không tìm thấy đơn vị')
    }
    Object.assign(unit, data)
    return this.unitRepository.save(unit)
  }

  async deleteUnit(id: number) {
    const unit = await this.unitRepository.findOne({ where: { id } })
    if (!unit) {
      throw new NotFoundException('Không tìm thấy đơn vị')
    }
    await this.unitRepository.delete(id)
    return { message: 'Đã xóa đơn vị' }
  }

  // ================== ATTRIBUTES ==================
  async getAllAttributes() {
    return this.attributeRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    })
  }

  async createAttribute(data: Partial<Attribute>) {
    const attribute = this.attributeRepository.create(data)
    return this.attributeRepository.save(attribute)
  }

  async updateAttribute(id: number, data: Partial<Attribute>) {
    const attribute = await this.attributeRepository.findOne({ where: { id } })
    if (!attribute) {
      throw new NotFoundException('Không tìm thấy thuộc tính')
    }
    Object.assign(attribute, data)
    return this.attributeRepository.save(attribute)
  }

  async deleteAttribute(id: number) {
    const attribute = await this.attributeRepository.findOne({ where: { id } })
    if (!attribute) {
      throw new NotFoundException('Không tìm thấy thuộc tính')
    }
    await this.attributeRepository.delete(id)
    return { message: 'Đã xóa thuộc tính' }
  }
}





