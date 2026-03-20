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
} from "./src/domain/events";

function setupEventListeners(eventEmitter: EventEmitter): void {
  console.log("Setting up event listeners...\n");

  eventEmitter.subscribe<StudentEnrolledEvent>("StudentEnrolled", (event) => {
    console.log(`[StudentEnrolled] ${event.studentName} enrolled in ${event.courseName}`);
    console.log(`Enrollment ID: ${event.enrollmentId}\n`);
  });

  eventEmitter.subscribe<EnrollmentCancelledEvent>("EnrollmentCancelled", (event) => {
    console.log(`[EnrollmentCancelled] Enrollment cancelled`);
    console.log(`Enrollment ID: ${event.enrollmentId}`);
    console.log(`Student: ${event.studentId} | Course: ${event.courseCode}`);
    console.log(`Credits released: ${event.creditsReleased}\n`);
  });
}

function runScenario5(): void {
  console.log("\nSCENARIO 5: Cancel an Enrollment\n");

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

  const semester = createSemester("Fall2024");
  if (isError(semester)) {
    console.error("Failed to create semester");
    return;
  }

  // Enroll student
  console.log("Step 1: Enrolling Alice in CS101...\n");
  const enrollment = enrollmentService.enrollStudent(aliceId, cs101Code, semester);

  if (enrollment instanceof Error) {
    console.error(`Error: ${enrollment.message}`);
    return;
  }

  // Show status before cancellation
  console.log("Status before cancellation:");
  const aliceBefore = enrollmentService.getStudent(aliceId);
  const cs101Before = enrollmentService.getCourse(cs101Code);
  
  if (aliceBefore && cs101Before) {
    console.log(`Alice's credits: ${aliceBefore.getCreditsForSemester(semester)}`);
    console.log(`CS101 enrolled count: ${cs101Before.enrolledCount}`);
    console.log(`Enrollment status: ${enrollment.status}\n`);
  }

  // Cancel enrollment
  console.log("Step 2: Cancelling Alice's enrollment...\n");
  const cancelResult = enrollmentService.cancelEnrollment(enrollment.id);

  if (cancelResult instanceof Error) {
    console.error(`Error: ${cancelResult.message}`);
    return;
  }

  // Show status after cancellation
  console.log("Status after cancellation:");
  const aliceAfter = enrollmentService.getStudent(aliceId);
  const cs101After = enrollmentService.getCourse(cs101Code);
  
  if (aliceAfter && cs101After) {
    console.log(`Alice's credits: ${aliceAfter.getCreditsForSemester(semester)}`);
    console.log(`CS101 enrolled count: ${cs101After.enrolledCount}`);
    console.log(`Enrollment status: ${cancelResult.status}`);
  }

}

runScenario5();
