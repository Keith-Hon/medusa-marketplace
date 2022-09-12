import { Module } from "medusa-extender";
import { RegionService } from "./services/region.service";

@Module({
    imports: [RegionService]
})
export class RegionModule {}
