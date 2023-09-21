import { IsDefined, IsString } from "class-validator";

export class CreateCustomDTO {
  @IsDefined()
  @IsString()
  url: string;

  @IsDefined()
  @IsString()
  customUrl: string;
}
