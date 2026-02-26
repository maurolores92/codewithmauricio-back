import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { BoardService } from './board.service'
import { CreateBoardDto } from './dto/create-board.dto'
import { UpdateBoardDto } from './dto/update-board.dto'
import { Auth } from '../auth/decorators/auth.decorator'
import { ValidRoles } from '../auth/interfaces/valid-roles'
import { GetUser } from '../auth/decorators/get-user.decorator'
import { Users } from '../users/users.model'

@Controller('boards')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  private resolveTenantId(user: Users): number {
    const tenantId = user.isAdmin ? user.id : user.createdByAdminId
    console.log('[BoardController] Resolved tenantId:', {
      userId: user.id,
      isAdmin: user.isAdmin,
      createdByAdminId: user.createdByAdminId,
      resolvedTenantId: tenantId
    })
    return tenantId
  }

  @Post()
  @Auth()
  create(@Body() dto: CreateBoardDto, @GetUser() user: Users) {
    const tenantId = this.resolveTenantId(user)
    return this.boardService.create(dto, tenantId, user.id)
  }

  @Get()
  @Auth()
  findAll(@GetUser() user: Users) {
    const tenantId = this.resolveTenantId(user)
    return this.boardService.findAll(tenantId)
  }

  @Put('reorder')
  @Auth()
  reorder(@Body() dto: { boardIds: number[] }, @GetUser() user: Users) {
    const tenantId = this.resolveTenantId(user)
    return this.boardService.reorder(dto.boardIds, tenantId)
  }

  @Get(':id')
  @Auth()
  findOne(@Param('id') id: string, @GetUser() user: Users) {
    const tenantId = this.resolveTenantId(user)
    return this.boardService.findOne(+id, tenantId)
  }

  @Put(':id')
  @Auth()
  update(@Param('id') id: string, @Body() dto: UpdateBoardDto, @GetUser() user: Users) {
    const tenantId = this.resolveTenantId(user)
    return this.boardService.update(+id, dto, tenantId)
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id') id: string, @GetUser() user: Users) {
    const tenantId = this.resolveTenantId(user)
    return this.boardService.remove(+id, tenantId)
  }
}
