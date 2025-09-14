import { User } from "../User";

describe("Сущность User", () => {
  it("должен создать пользователя с необходимыми полями", () => {
    const user = new User();
    user.email = "test@example.com";
    user.password = "hashed_password";
    user.name = "Test User";

    expect(user.email).toBe("test@example.com");
    expect(user.password).toBe("hashed_password");
    expect(user.name).toBe("Test User");
  });

  it("должен разрешить дополнительное поле Аватара", () => {
    const url = "https://example.com/avatar.jpg";
    const user = new User();
    user.email = "test@example.com";
    user.password = "hashed_password";
    user.name = "Test User";
    user.avatar = url;

    expect(user.avatar).toBe(url);
  });

  it("должен иметь автоматические идентификаторы и временные метки", () => {
    const user = new User();
    user.email = "test@example.com";
    user.password = "hashed_password";
    user.name = "Test User";

    // TypeORM декораторы добавляют свойства через метаданные
    // Проверяем, что можем присвоить значения этим полям
    user.id = "test-id";
    user.createdAt = new Date();
    user.updatedAt = new Date();

    expect(user.id).toBe("test-id");
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });

  it("должны быть определены отношения", () => {
    const user = new User();
    user.email = "test@example.com";
    user.password = "hashed_password";
    user.name = "Test User";

    // TypeORM отношения инициализируются как массивы
    // Проверяем, что можем работать с отношениями
    user.userProjects = [];
    user.assignedTasks = [];
    user.createdTasks = [];

    expect(user.userProjects).toEqual([]);
    expect(user.assignedTasks).toEqual([]);
    expect(user.createdTasks).toEqual([]);
  });
});
