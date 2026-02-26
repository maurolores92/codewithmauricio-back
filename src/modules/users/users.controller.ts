import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, Query, Put, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { FindAllQuerysDto } from './dto/querys.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { BadRequestException } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Post() @Auth()
  async create(@Body() createUserDto: CreateUserDto, @GetUser() user: any) {
    // Verificar que el usuario que crea es admin
    const adminUser = await this.usersService.findOne(user.id);
    if (!adminUser.isAdmin) {
      throw new BadRequestException('Solo usuarios admin pueden crear nuevos usuarios');
    }
    return this.usersService.create(createUserDto, user.id);
  }

  @Get('all') @Auth()
  findAll(@GetUser() user: any) {
    return this.usersService.findAll(user.id);
  }

  @Get('profile-with-roles') @Auth()
  async getProfile(@GetUser() user: any) {
    return this.usersService.getUserProfile(user.id);
  }

  @Post('roles/create') @Auth()
  async createCustomRole(@Body() roleData: any, @GetUser() user: any) {
    console.log('[UsersController] createCustomRole - User from @GetUser():', {
      id: user?.id,
      email: user?.email,
      isAdmin: user?.isAdmin,
      role: user?.role
    });
    return this.usersService.createCustomRole(user.id, roleData);
  }

  @Get('roles/my-roles') @Auth()
  async getMyRoles(@GetUser() user: any) {
    return this.usersService.getUserCustomRoles(user.id);
  }

  @Get('roles/available') @Auth()
  async getAvailableRoles() {
    return this.usersService.getAllAvailableRoles();
  }

  @Put('roles/:id')
  @Auth()
  async updateCustomRole(
    @Param('id') id: string,
    @Body() roleData: any,
    @GetUser() user: any
  ) {
    return this.usersService.updateCustomRole(user.id, +id, roleData);
  }

  @Delete('roles/:id') @Auth()
   async deleteCustomRole(
    @Param('id') id: string,
    @GetUser() user: any
  ) {
    await this.usersService.deleteCustomRole(user.id, +id);
    return { message: 'Rol eliminado exitosamente' };
  }

  @Get('')  @Auth(ValidRoles.superadmin) 
  async findAllQuerys(
    @Query(new ValidationPipe({ transform: true })) query: FindAllQuerysDto) {
    const { page = 0, pageSize = 10, ...filters } = query;
    const users = await this.usersService.findAllQuerys(
      Number(page),
      Number(pageSize),
      filters,
    );
  
    return users;
  }

  @Get(':id') findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Put(':id') @Auth() update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @GetUser() user: any ) {
    // Si es admin, pasar su ID para verificar propiedad. Si es superadmin, no pasar ID (puede editar cualquiera)
    const adminId = user.role === 'admin' ? user.id : undefined;
    return this.usersService.updateUser(+id, updateUserDto, adminId);
  }

  @Delete(':id') @Auth() remove(@Param('id') id: string, @GetUser() user: any) {
    // Si es admin, pasar su ID para verificar propiedad. Si es superadmin, no pasar ID (puede eliminar cualquiera)
    const adminId = user.role === 'admin' ? user.id : undefined;
    return this.usersService.deleteUser(+id, adminId);
  }

  @Put(':id/change-password') @Auth(ValidRoles.superadmin)
  async changePassword(
    @Param('id') id: number,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    return this.usersService.changePassword(+id, changePasswordDto.password);
  }
}
