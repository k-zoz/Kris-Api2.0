import moment from "moment";
import { User } from "@prisma/client";
export class Utils {
  static convertDateToString = (val: Date) => moment(val);

  // static exclude<User, Key extends keyof User>(user: User, keys: Key[]): Omit<User, Key> {
  //   return Object.fromEntries(Object.entries(user).filter(([key]) => !keys.includes(key))
  //   );
  // }


}


