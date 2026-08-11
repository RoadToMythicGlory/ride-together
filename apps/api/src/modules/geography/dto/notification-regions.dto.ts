import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  Validate,
  ValidateNested,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'cityXorRegion', async: false })
class CityXorRegionConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments) {
    const obj = args.object as NotificationRegionItemDto;
    const hasCity = Boolean(obj.cityId);
    const hasRegion = Boolean(obj.regionId);
    return (hasCity || hasRegion) && !(hasCity && hasRegion);
  }

  defaultMessage() {
    return 'Each subscription must include exactly one of cityId or regionId';
  }
}

export class NotificationRegionItemDto {
  @IsOptional()
  @IsString()
  cityId?: string;

  @IsOptional()
  @IsString()
  regionId?: string;

  @Validate(CityXorRegionConstraint)
  private readonly _xorCheck = true;
}

export class ReplaceNotificationRegionsDto {
  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => NotificationRegionItemDto)
  items!: NotificationRegionItemDto[];
}
