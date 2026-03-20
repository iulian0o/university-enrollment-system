import { EventEmitter } from "./src/infrastructure/event_emitter";
import { EnrollmentService } from "./src/domain/enrollment_service";
import { Student } from "./src/domain/student_entity";
import { Course } from "./src/domain/course_entity";
import {
  createStudentId,
  createCourseCode,
  createEmail,
  createCredits,
  createSemester,
  isError,
} from "./src/domain/branded_types";
import {
  StudentEnrolledEvent,
  CourseCapacityReachedEvent,
} from "./src/domain/events";

function setupEventListeners(eventEmitter: EventEmitter): void {
  console.log("Setting up event listeners...\n");

  eventEmitter.subscribe<StudentEnrolledEvent>("StudentEnrolled", (event) => {
    console.log(`[StudentEnrolled] ${event.studentName} enrolled in ${event.courseName}`);
  });

  eventEmitter.subscribe<CourseCapacityReachedEvent>("CourseCapacityReached", (event) => {
    console.log(`[CourseCapacityReached] ${event.courseName} is ${event.percentage}% full!`);
    console.log(`Enrolled: ${event.enrolledCount}/${event.capacity}\n`);
  });
}

function runScenario2(): void {
  console.log("\nSCENARIO 2: Course Reaches 80% Capacity\n");

  const eventEmitter = new EventEmitter();
  const enrollmentService = new EnrollmentService(eventEmitter);

  setupEventListeners(eventEmitter);

  // Create students
  const students = [
    { id: "STU123456", name: "Alice Johnson", email: "alice@epita.fr" },
    { id: "STU123457", name: "Bob Smith", email: "bob@epita.fr" },
    { id: "STU123458", name: "Charlie Brown", email: "charlie@epita.fr" },
    { id: "STU123459", name: "Dave Wilson", email: "dave@epita.fr" },
  ];

  students.forEach(s => {
    const id = createStudentId(s.id);
    const email = createEmail(s.email);
    if (!isError(id) && !isError(email)) {
      const student = new Student(id, s.name, email);
      enrollmentService.addStudent(student);
    }
  });

  console.log("Created 4 students: Alice, Bob, Charlie, Dave\n");

  // Create course with capacity 5
  const cs101Code = createCourseCode("CS101");
  const credits3 = createCredits(3);

  if (isError(cs101Code) || isError(credits3)) {
    console.error("Failed to create course data");
    return;
  }

  const cs101 = new Course(cs101Code, "Introduction to Computer Science", credits3, 5);
  enrollmentService.addCourse(cs101);
  console.log("Created course: CS101 - Introduction to Computer Science");
  console.log("Capacity: 5 students\n");

  const semester = createSemester("Fall2024");
  if (isError(semester)) {
    console.error("Failed to create semester");
    return;
  }

  // Enroll students to reach 80%
  console.log("Enrolling students...\n");

  students.forEach((s, index) => {
    const id = createStudentId(s.id);
    if (!isError(id) && !isError(cs101Code)) {
      console.log(`${index + 1}. Enrolling ${s.name} (${index + 1}/5 = ${(index + 1) * 20}%)`);
      const enrollment = enrollmentService.enrollStudent(id, cs101Code, semester);
      if (enrollment instanceof Error) {
        console.error(`Error: ${enrollment.message}`);
      }
    }
  });

  // Show final status
  const cs101Updated = enrollmentService.getCourse(cs101Code);
  if (cs101Updated) {
    console.log("\nFinal status: ");
    console.log(`Course: ${cs101Updated.name}`);
    console.log(`Enrolled: ${cs101Updated.enrolledCount}/${cs101Updated.capacity}`);
    console.log(`Percentage: ${cs101Updated.getCapacityPercentage()}%`);
  }

}

runScenario2();
