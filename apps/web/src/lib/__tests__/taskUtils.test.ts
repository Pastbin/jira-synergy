import { computeNewTaskOrder, isAllowedTaskStatus } from "../taskUtils";

describe("taskUtils", () => {
  describe("computeNewTaskOrder", () => {
    it("возвращает 1000, если в колонке ещё нет задач", () => {
      expect(computeNewTaskOrder(null)).toBe(1000);
    });

    it("возвращает lastOrder + 1000 для следующей задачи", () => {
      expect(computeNewTaskOrder(1000)).toBe(2000);
      expect(computeNewTaskOrder(5000)).toBe(6000);
    });
  });

  describe("isAllowedTaskStatus", () => {
    it("принимает допустимые статусы", () => {
      expect(isAllowedTaskStatus("TODO")).toBe(true);
      expect(isAllowedTaskStatus("IN_PROGRESS")).toBe(true);
      expect(isAllowedTaskStatus("DONE")).toBe(true);
    });

    it("отклоняет недопустимые значения", () => {
      expect(isAllowedTaskStatus("")).toBe(false);
      expect(isAllowedTaskStatus("INVALID")).toBe(false);
    });
  });
});
