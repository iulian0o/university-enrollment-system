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

  eventEmitter.subscribe<StudentEnrolledEvent>("StudentEnrolled", (event) => {
    console.log(`[StudentEnrolled] ${event.studentName} enrolled in ${event.courseName}`);
    console.log(`Course: ${event.courseCode} | Semester: ${event.semester} | Credits: ${event.credits}`);
    console.log(`Enrollment ID: ${event.enrollmentId}\n`);
  });

  eventEmitter.subscribe<CourseCapacityReachedEvent>("CourseCapacityReached", (event) => {
    console.log(`[CourseCapacityReached] ${event.courseName} is ${event.percentage}% full!`);
    console.log(`Enrolled: ${event.enrolledCount}/${event.capacity}\n`);
  });

  eventEmitter.subscribe<CourseFullEvent>("CourseFull", (event) => {
    console.log(`[CourseFull] ${event.courseName} is now FULL!`);
    console.log(`Capacity: ${event.capacity}/${event.capacity}\n`);
  });

  eventEmitter.subscribe<EnrollmentCancelledEvent>("EnrollmentCancelled", (event) => {
    console.log(`[EnrollmentCancelled] Enrollment cancelled`);
    console.log(`Enrollment ID: ${event.enrollmentId}`);
    console.log(`Student: ${event.studentId} | Course: ${event.courseCode}`);
    console.log(`Credits released: ${event.creditsReleased}\n`);
  });
}

function printSeparator(title: string): void {
  console.log(`\n${"=".repeat(80)}`);
  console.log(`  ${title}`);
  console.log(`${"=".repeat(80)}\n`);
}

function main(): void {
  console.log("\n");
  console.log("University Enrollment System - CLI Demo");
  console.log("Demonstrating Domain-Driven Design with Branded Types and Observer Pattern");
  console.log("\n");

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

  // Create courses
  const cs101Code = createCourseCode("CS101");
  const math203Code = createCourseCode("MATH203");
  const phys101Code = createCourseCode("PHYS101");

  if (isError(cs101Code) || isError(math203Code) || isError(phys101Code)) {
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
  console.log("CS101 - Introduction to Computer Science (Capacity: 5, Credits: 3)");
  console.log("MATH203 - Calculus III (Capacity: 30, Credits: 4)");
  console.log("PHYS101 - Physics I (Capacity: 25, Credits: 6)");
  console.log();

  const semester = createSemester("Fall2024");
  if (isError(semester)) {
    console.error("Failed to create semester");
    return;
  }

  // SCENARIO 1: Successful Enrollment
  printSeparator("SCENARIO 1: Successful Enrollment");

  console.log("Enrolling Alice in CS101...\n");
  const enrollment1 = enrollmentService.enrollStudent(aliceId, cs101Code, semester);

  if (enrollment1 instanceof Error) {
    console.error(`Error: ${enrollment1.message}\n`);
  } else {
    console.log(`Success! Enrollment created: ${enrollment1.id}\n`);
  }

  // SCENARIO 2: Course Reaches 80% Capacity
  printSeparator("SCENARIO 2: Course Reaches 80% Capacity");

  console.log("CS101 capacity: 5 students");
  console.log("Current enrollment: 1 student (20%)");
  console.log("Enrolling Bob, Charlie, and one more to reach 80%...\n");

  const enrollment2 = enrollmentService.enrollStudent(bobId, cs101Code, semester);
  if (enrollment2 instanceof Error) console.error(`Error: ${enrollment2.message}\n`);

  const enrollment3 = enrollmentService.enrollStudent(charlieId, cs101Code, semester);
  if (enrollment3 instanceof Error) console.error(`Error: ${enrollment3.message}\n`);

  const daveId = createStudentId("STU123459");
  const daveEmail = createEmail("dave@epita.fr");
  if (!isError(daveId) && !isError(daveEmail)) {
    const dave = new Student(daveId, "Dave Wilson", daveEmail);
    enrollmentService.addStudent(dave);
    const enrollment4 = enrollmentService.enrollStudent(daveId, cs101Code, semester);
    if (enrollment4 instanceof Error) console.error(`Error: ${enrollment4.message}\n`);
  }

  const cs101Updated = enrollmentService.getCourse(cs101Code);
  if (cs101Updated) {
    console.log(`Current status: ${cs101Updated.name}`);
    console.log(`Enrolled: ${cs101Updated.enrolledCount}/${cs101Updated.capacity}\n`);
  }

  // SCENARIO 3: Course Becomes Full
  printSeparator("SCENARIO 3: Course Becomes Full");

  console.log("Enrolling one more student to fill CS101...\n");

  const eveId = createStudentId("STU123460");
  const eveEmail = createEmail("eve@epita.fr");
  if (!isError(eveId) && !isError(eveEmail)) {
    const eve = new Student(eveId, "Eve Martinez", eveEmail);
    enrollmentService.addStudent(eve);
    const enrollment5 = enrollmentService.enrollStudent(eveId, cs101Code, semester);
    if (enrollment5 instanceof Error) console.error(`Error: ${enrollment5.message}\n`);
  }

  const cs101Full = enrollmentService.getCourse(cs101Code);
  if (cs101Full) {
    console.log(`Current status: ${cs101Full.name}`);
    console.log(`Enrolled: ${cs101Full.enrolledCount}/${cs101Full.capacity}\n`);
  }

  console.log("Attempting to enroll another student in full course...\n");
  const frankId = createStudentId("STU123461");
  const frankEmail = createEmail("frank@epita.fr");
  if (!isError(frankId) && !isError(frankEmail)) {
    const frank = new Student(frankId, "Frank Lee", frankEmail);
    enrollmentService.addStudent(frank);
    const failedEnrollment = enrollmentService.enrollStudent(frankId, cs101Code, semester);
    if (failedEnrollment instanceof Error) {
      console.error(`Error (Expected): ${failedEnrollment.message}\n`);
    }
  }

  // SCENARIO 4: Student Exceeds 18 Credits
  printSeparator("SCENARIO 4: Student Exceeds 18 Credit Limit");

  const graceId = createStudentId("STU123462");
  const graceEmail = createEmail("grace@epita.fr");

  if (!isError(graceId) && !isError(graceEmail)) {
    const grace = new Student(graceId, "Grace Taylor", graceEmail);
    enrollmentService.addStudent(grace);

    console.log("Enrolling Grace in MATH203 (4 credits)...");
    const e1 = enrollmentService.enrollStudent(graceId, math203Code, semester);
    if (e1 instanceof Error) console.error(`Error: ${e1.message}`);

    console.log("Enrolling Grace in PHYS101 (6 credits)...");
    const e2 = enrollmentService.enrollStudent(graceId, phys101Code, semester);
    if (e2 instanceof Error) console.error(`Error: ${e2.message}`);

    const chem101Code = createCourseCode("CHEM101");
    if (!isError(chem101Code)) {
      const chem101 = new Course(chem101Code, "Chemistry I", credits6, 30);
      enrollmentService.addCourse(chem101);

      console.log("Enrolling Grace in CHEM101 (6 credits)...");
      const e3 = enrollmentService.enrollStudent(graceId, chem101Code, semester);
      if (e3 instanceof Error) console.error(`Error: ${e3.message}`);
    }

    const graceUpdated = enrollmentService.getStudent(graceId);
    if (graceUpdated) {
      const currentCredits = graceUpdated.getCreditsForSemester(semester);
      console.log(`\nGrace's current credits for ${semester}: ${currentCredits}/18\n`);
    }

    const eng201Code = createCourseCode("ENG201");
    if (!isError(eng201Code)) {
      const eng201 = new Course(eng201Code, "English Literature", credits4, 30);
      enrollmentService.addCourse(eng201);

      console.log("Attempting to enroll Grace in ENG201 (4 credits)...");
      console.log("This would bring total to 20 credits, exceeding the 18-credit limit.\n");

      const failedEnrollment = enrollmentService.enrollStudent(graceId, eng201Code, semester);
      if (failedEnrollment instanceof Error) {
        console.error(`Error (Expected): ${failedEnrollment.message}\n`);
      }
    }
  }

  // SCENARIO 5: Cancel an Enrollment
  printSeparator("SCENARIO 5: Cancel an Enrollment");

  console.log("Cancelling Alice's enrollment in CS101...\n");

  if (enrollment1 instanceof Error) {
    console.log("Cannot cancel - enrollment failed earlier\n");
  } else {
    const cancelResult = enrollmentService.cancelEnrollment(enrollment1.id);
    if (cancelResult instanceof Error) {
      console.error(`Error: ${cancelResult.message}\n`);
    } else {
      console.log(`Successfully cancelled enrollment ${enrollment1.id}\n`);

      const aliceUpdated = enrollmentService.getStudent(aliceId);
      if (aliceUpdated) {
        console.log(`Alice's credits for ${semester}: ${aliceUpdated.getCreditsForSemester(semester)}`);
      }

      const cs101AfterCancel = enrollmentService.getCourse(cs101Code);
      if (cs101AfterCancel) {
        console.log(`CS101 enrolled count: ${cs101AfterCancel.enrolledCount}/${cs101AfterCancel.capacity}\n`);
      }
    }
  }

  // Final Statistics
  printSeparator("Final System Statistics");

  const stats = enrollmentService.getStatistics();
  console.log("System Statistics:");
  console.log(`Total Students: ${stats.totalStudents}`);
  console.log(`Total Courses: ${stats.totalCourses}`);
  console.log(`Total Enrollments: ${stats.totalEnrollments}`);
  console.log(`Active Enrollments: ${stats.activeEnrollments}`);
  console.log(`Cancelled Enrollments: ${stats.cancelledEnrollments}`);
  console.log();

  printSeparator("Demo Complete");

  console.log("All scenarios demonstrated successfully!");
  console.log();
  console.log("This demo showcased:");
  console.log("- Branded Types with smart constructors");
  console.log("- Domain-Driven Design with entities and value objects");
  console.log("- Observer Pattern with typed events");
  console.log("- Business rule enforcement");
  console.log("- Immutability and type safety");
  console.log();
}

main();
