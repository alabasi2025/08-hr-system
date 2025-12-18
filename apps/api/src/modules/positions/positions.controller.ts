import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Controller('api/v1/positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPositionDto: CreatePositionDto) {
    return this.positionsService.create(createPositionDto);
  }

  @Get()
  findAll(
    @Query('departmentId') departmentId?: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.positionsService.findAll(departmentId, includeInactive === 'true');
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.positionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePositionDto: UpdatePositionDto,
  ) {
    return this.positionsService.update(id, updatePositionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.positionsService.remove(id);
  }
}
