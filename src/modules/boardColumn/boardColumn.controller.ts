import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { BoardColumnService } from './boardColumn.service'
import { CreateBoardColumnDto } from './dto/create-board-column.dto'
import { UpdateBoardColumnDto } from './dto/update-board-column.dto'
import { ReorderBoardColumnsDto } from './dto/reorder-board-columns.dto'
import { Auth } from '../auth/decorators/auth.decorator'
import { ValidRoles } from '../auth/interfaces/valid-roles'
import { GetUser } from '../auth/decorators/get-user.decorator'
import { Users } from '../users/users.model'

@Controller()
export class BoardColumnController {
  constructor(private readonly boardColumnService: BoardColumnService) {}

  private resolveTenantId(user: Users): number {
    const tenantId = user.isAdmin ? user.id : user.createdByAdminId
    console.log('[BoardColumnController] Resolved tenantId:', {
      userId: user.id,
      isAdmin: user.isAdmin,
      createdByAdminId: user.createdByAdminId,
      resolvedTenantId: tenantId
    })
    return tenantId
  }

  @Post('boards/:boardId/columns')
  @Auth()
  create(@Param('boardId') boardId: string, @Body() dto: CreateBoardColumnDto, @GetUser() user: Users) {
    const tenantId = this.resolveTenantId(user)
    return this.boardColumnService.create({ ...dto, boardId: +boardId }, tenantId, user.id)
  }

  @Get('boards/:boardId/columns')
  @Auth()
  findByBoard(@Param('boardId') boardId: string, @GetUser() user: Users) {
    const tenantId = this.resolveTenantId(user)
    return this.boardColumnService.findByBoard(+boardId, tenantId)
  }

  @Get('columns/:id')
  @Auth()
  findOne(@Param('id') id: string, @GetUser() user: Users) {
    const tenantId = this.resolveTenantId(user)
    return this.boardColumnService.findOne(+id, tenantId)
  }

  @Put('columns/reorder')
  @Auth()
  reorder(@Body() dto: ReorderBoardColumnsDto, @GetUser() user: Users) {
    const tenantId = this.resolveTenantId(user)
    return this.boardColumnService.reorder(dto, tenantId)
  }

  @Put('columns/:id')
  @Auth()
  update(@Param('id') id: string, @Body() dto: UpdateBoardColumnDto, @GetUser() user: Users) {
    const tenantId = this.resolveTenantId(user)
    return this.boardColumnService.update(+id, dto, tenantId)
  }

  @Delete('columns/:id')
  @Auth()
  remove(@Param('id') id: string, @GetUser() user: Users) {
    const tenantId = this.resolveTenantId(user)
    return this.boardColumnService.remove(+id, tenantId)
  }
}
