import { IsDefined, IsString } from "class-validator";

export class CreateUrlDto {
  //   @IsDefined()
  //   @IsString()
  url: string;

  customUrl: string;
}
