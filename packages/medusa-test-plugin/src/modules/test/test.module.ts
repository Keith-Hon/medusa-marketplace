import { Module } from "medusa-extender";
import { TestRouter } from "packages/medusa-test-plugin/src/modules/test/test.route";

@Module({
    imports: [TestRouter]
})
export class TestModule {}
