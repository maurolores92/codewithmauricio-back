import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, Query, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { FindAllQuerysDto } from './dto/querys.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @Auth(ValidRoles.superadmin)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('all')
  findAll() {
    return this.usersService.findAll();
  }

  @Get('')
  @Auth(ValidRoles.superadmin)
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @Auth(ValidRoles.superadmin)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.delete(+id);
  }

  @Put(':id/change-password')
  @Auth(ValidRoles.superadmin)
  async changePassword(
    @Param('id') id: number,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    return this.usersService.changePassword(+id, changePasswordDto.password);
  }

  @Get('profile-with-roles')
  @Auth(ValidRoles.usuario, ValidRoles.superadmin)
  async getProfile(@GetUser() user: any) {
    return this.usersService.getUserProfile(user.id);
  }
}
