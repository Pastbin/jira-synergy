import { AppDataSource } from "../config";
import { User } from "../../entities/User";
import { Project } from "../../entities/Project";
import { Task } from "../../entities/Task";
import { UserProject } from "../../entities/UserProject";
import * as bcrypt from "bcryptjs";

export async function seedInitialData(): Promise<void> {
  try {
    await AppDataSource.initialize();

    const userRepository = AppDataSource.getRepository(User);
    const projectRepository = AppDataSource.getRepository(Project);
    const taskRepository = AppDataSource.getRepository(Task);
    const userProjectRepository = AppDataSource.getRepository(UserProject);

    await taskRepository.delete({});
    await userProjectRepository.delete({});
    await projectRepository.delete({});
    await userRepository.delete({});

    const hashedPassword = await bcrypt.hash("password123", 12);

    const user1 = userRepository.create({
      email: "admin@example.com",
      password: hashedPassword,
      name: "Admin User",
    });

    const user2 = userRepository.create({
      email: "user@example.com",
      password: hashedPassword,
      name: "Regular User",
    });

    const savedUsers = await userRepository.save([user1, user2]);

    const project1 = projectRepository.create({
      name: "Website Redesign",
      description: "Complete redesign of company website",
      ownerId: savedUsers[0].id,
    });

    const project2 = projectRepository.create({
      name: "Mobile App Development",
      description: "New mobile application for iOS and Android",
      ownerId: savedUsers[0].id,
    });

    const savedProjects = await projectRepository.save([project1, project2]);

    const userProject1 = userProjectRepository.create({
      userId: savedUsers[0].id,
      projectId: savedProjects[0].id,
      role: "owner",
    });

    const userProject2 = userProjectRepository.create({
      userId: savedUsers[1].id,
      projectId: savedProjects[0].id,
      role: "member",
    });

    const userProject3 = userProjectRepository.create({
      userId: savedUsers[0].id,
      projectId: savedProjects[1].id,
      role: "owner",
    });

    await userProjectRepository.save([
      userProject1,
      userProject2,
      userProject3,
    ]);

    const tasks = [
      {
        title: "Design Homepage",
        description: "Create new homepage design mockups",
        status: "todo" as const,
        priority: 1,
        projectId: savedProjects[0].id,
        creatorId: savedUsers[0].id,
      },
      {
        title: "Develop Header Component",
        description: "Implement responsive header with navigation",
        status: "in_progress" as const,
        priority: 2,
        projectId: savedProjects[0].id,
        assigneeId: savedUsers[1].id,
        creatorId: savedUsers[0].id,
      },
      {
        title: "API Integration",
        description: "Connect frontend to backend APIs",
        status: "review" as const,
        priority: 3,
        projectId: savedProjects[0].id,
        creatorId: savedUsers[0].id,
      },
      {
        title: "App Icon Design",
        description: "Design application icon for app stores",
        status: "todo" as const,
        priority: 1,
        projectId: savedProjects[1].id,
        creatorId: savedUsers[0].id,
      },
    ];

    await taskRepository.save(tasks.map((task) => taskRepository.create(task)));

    console.log("Initial data seeded successfully");
  } catch (error) {
    console.error("Error seeding initial data:", error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

if (require.main === module) {
  seedInitialData().catch(console.error);
}
