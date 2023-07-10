import { BaseDto } from "@core/dto/global/base-dto";

export class SearchRequest extends BaseDto{
  readonly skip: number
  readonly take: number
}
