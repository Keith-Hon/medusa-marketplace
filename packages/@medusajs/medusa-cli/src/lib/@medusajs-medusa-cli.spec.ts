import { medusajsMedusaCli } from "./@medusajs-medusa-cli";

describe("medusajsMedusaCli", () => {
    it("should work", () => {
        expect(medusajsMedusaCli()).toEqual("@medusajs-medusa-cli");
    });
});
