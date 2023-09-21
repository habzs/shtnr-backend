import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import Utils from "../../utilities/emailValidator";

@ValidatorConstraint({ name: "IsEmailValid", async: false })
export class IsEmailValid implements ValidatorConstraintInterface {
  validate(input: string, args: ValidationArguments) {
    if (!Utils.emailValidator(input)) {
      if (args && args.constraints && args.constraints[0]) {
        // console.log("error thrown");
        // throw new Error(args.constraints[0]);
        return false;
      }

      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return "$value is not a valid email format";
  }
}
