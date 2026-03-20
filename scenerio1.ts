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
import { StudentEnrolledEvent } from "./src/domain/events";

function setupEventListeners(eventEmitter: EventEmitter): void {
  console.log("Setting up event listeners...\n");

  eventEmitter.subscribe<StudentEnrolledEvent>("StudentEnrolled", (event) => {
    console.log(`[StudentEnrolled] ${event.studentName} enrolled in ${event.courseName}`);
    console.log(`Course: ${event.courseCode} | Semester: ${event.semester} | Credits: ${event.credits}`);
    console.log(`Enrollment ID: ${event.enrollmentId}\n`);
  });
}

function runScenario1(): void {
  console.log("\n=== SCENARIO 1: Successful Enrollment ===\n");

  const eventEmitter = new EventEmitter();
  const enrollmentService = new EnrollmentService(eventEmitter);

  setupEventListeners(eventEmitter);

  // Create student
  const aliceId = createStudentId("STU123456");
  const aliceEmail = createEmail("alice@epita.fr");

  if (isError(aliceId) || isError(aliceEmail)) {
    console.error("Failed to create student data");
    return;
  }

  const alice = new Student(aliceId, "Alice Johnson", aliceEmail);
  enrollmentService.addStudent(alice);
  console.log("Created student: Alice Johnson (STU123456)\n");

  // Create course
  const cs101Code = createCourseCode("CS101");
  const credits3 = createCredits(3);

  if (isError(cs101Code) || isError(credits3)) {
    console.error("Failed to create course data");
    return;
  }

  const cs101 = new Course(cs101Code, "Introduction to Computer Science", credits3, 30);
  enrollmentService.addCourse(cs101);
  console.log("Created course: CS101 - Introduction to Computer Science");
  console.log("Capacity: 0/30 | Credits: 3\n");

  // Create semester
  const semester = createSemester("Fall2024");
  if (isError(semester)) {
    console.error("Failed to create semester");
    return;
  }

  // Enroll student
  console.log("Enrolling Alice in CS101...\n");
  const enrollment = enrollmentService.enrollStudent(aliceId, cs101Code, semester);

  if (enrollment instanceof Error) {
    console.error(`Error: ${enrollment.message}`);
  } else {
    console.log(`Success! Enrollment created: ${enrollment.id}`);
  }
}

runScenario1();
