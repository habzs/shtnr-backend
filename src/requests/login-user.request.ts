import { IsDefined, IsString } from "class-validator";

export class LoginUserRequestDTO {
  //   @IsDefined()
  //   @IsString()
  email: string;
  password: string;
}
