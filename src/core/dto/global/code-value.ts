import { ApiProperty } from "@nestjs/swagger";

export class CodeValue {
  @ApiProperty()
  code: string;
  @ApiProperty()
  value: string;

  static of(code: string, value: string): CodeValue {
    const cd = new CodeValue();
    cd.code = code;
    cd.value = value;
    return cd;
  }
}
