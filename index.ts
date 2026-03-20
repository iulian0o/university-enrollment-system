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
  EnrollmentCancelledEvent,
  CourseCapacityReachedEvent,
  CourseFullEvent,
} from "./src/domain/events";

function setupEventListeners(eventEmitter: EventEmitter): void {
  console.log("Setting up event listeners...\n");

  // Listen for StudentEnrolled events
  eventEmitter.subscribe<StudentEnrolledEvent>(
    "StudentEnrolled",
    (event) => {
      console.log(`[StudentEnrolled] ${event.studentName} enrolled in ${event.courseName}`);
      console.log(`Course: ${event.courseCode} | Semester: ${event.semester} | Credits: ${event.credits}`);
      console.log(`Enrollment ID: ${event.enrollmentId}\n`);
    }
  );

  eventEmitter.subscribe<CourseCapacityReachedEvent>(
    "CourseCapacityReached",
    (event) => {
      console.log(`⚠️  [CourseCapacityReached] ${event.courseName} is ${event.percentage}% full!`);
      console.log(`   📊 Enrolled: ${event.enrolledCount}/${event.capacity}\n`);
    }
  );

  // Listen for CourseFull events (100% capacity)
  eventEmitter.subscribe<CourseFullEvent>("CourseFull", (event) => {
    console.log(`🚫 [CourseFull] ${event.courseName} is now FULL!`);
    console.log(`   📊 Capacity: ${event.capacity}/${event.capacity}\n`);
  });

  // Listen for EnrollmentCancelled events
  eventEmitter.subscribe<EnrollmentCancelledEvent>(
    "EnrollmentCancelled",
    (event) => {
      console.log(`[EnrollmentCancelled] Enrollment cancelled`);
      console.log(`Enrollment ID: ${event.enrollmentId}`);
      console.log(`Student: ${event.studentId} | Course: ${event.courseCode}`);
      console.log(`Credits released: ${event.creditsReleased}\n`);
    }
  );
}

// Helper Functions

function printSeparator(title: string): void {
  console.log(`\n${"=".repeat(80)}`);
  console.log(`  ${title}`);
  console.log(`${"=".repeat(80)}\n`);
}

function printError(error: Error): void {
  console.log(`Error: ${error.message}\n`);
}

// Main CLI Function

function main(): void {
  console.log("\n🎓 University Enrollment System - CLI Demo\n");
  console.log("Demonstrating Domain-Driven Design with Branded Types and Observer Pattern\n");

  // Initialize the system
  const eventEmitter = new EventEmitter();
  const enrollmentService = new EnrollmentService(eventEmitter);

  setupEventListeners(eventEmitter);

  // Create Test Data

  printSeparator("Creating Test Data");

  // Create students
  const aliceId = createStudentId("STU123456");
  const bobId = createStudentId("STU123457");
  const charlieId = createStudentId("STU123458");

  if (isError(aliceId) || isError(bobId) || isError(charlieId)) {
    console.error("Failed to create student IDs");
    return;
  }

  const aliceEmail = createEmail("alice@epita.fr");
  const bobEmail = createEmail("bob@epita.fr");
  const charlieEmail = createEmail("charlie@epita.fr");

  if (isError(aliceEmail) || isError(bobEmail) || isError(charlieEmail)) {
    console.error("Failed to create emails");
    return;
  }

  const alice = new Student(aliceId, "Alice Johnson", aliceEmail);
  const bob = new Student(bobId, "Bob Smith", bobEmail);
  const charlie = new Student(charlieId, "Charlie Brown", charlieEmail);

  enrollmentService.addStudent(alice);
  enrollmentService.addStudent(bob);
  enrollmentService.addStudent(charlie);

  console.log("Created 3 students: Alice, Bob, Charlie\n");

  // Courses
  const cs101Code = createCourseCode("CS101");
  const math203Code = createCourseCode("MATH203");
  const phys101Code = createCourseCode("PHYS101");

  if (
    isError(cs101Code) ||
    isError(math203Code) ||
    isError(phys101Code)
  ) {
    console.error("Failed to create course codes");
    return;
  }

  const credits3 = createCredits(3);
  const credits4 = createCredits(4);
  const credits6 = createCredits(6);

  if (isError(credits3) || isError(credits4) || isError(credits6)) {
    console.error("Failed to create credits");
    return;
  }

  const cs101 = new Course(cs101Code, "Introduction to Computer Science", credits3, 5);
  const math203 = new Course(math203Code, "Calculus III", credits4, 30);
  const phys101 = new Course(phys101Code, "Physics I", credits6, 25);

  enrollmentService.addCourse(cs101);
  enrollmentService.addCourse(math203);
  enrollmentService.addCourse(phys101);

  console.log("Created 3 courses:");
  console.log(`   - ${cs101.getSummary()}`);
  console.log(`   - ${math203.getSummary()}`);
  console.log(`   - ${phys101.getSummary()}\n`);

  const semester = createSemester("Fall2024");
  if (isError(semester)) {
    console.error("Failed to create semester");
    return;
  }
}