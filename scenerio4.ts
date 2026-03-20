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
    console.log(`[StudentEnrolled] ${event.studentName} enrolled in ${event.courseName} (${event.credits} credits)`);
  });
}

function runScenario4(): void {
  console.log("\nSCENARIO 4: Student Exceeds 18 Credit Limit\n");

  const eventEmitter = new EventEmitter();
  const enrollmentService = new EnrollmentService(eventEmitter);

  setupEventListeners(eventEmitter);

  // Create student
  const graceId = createStudentId("STU123462");
  const graceEmail = createEmail("grace@epita.fr");

  if (isError(graceId) || isError(graceEmail)) {
    console.error("Failed to create student data");
    return;
  }

  const grace = new Student(graceId, "Grace Taylor", graceEmail);
  enrollmentService.addStudent(grace);
  console.log("Created student: Grace Taylor (STU123462)\n");

  // Create courses with different credit values
  const courses = [
    { code: "MATH203", name: "Calculus III", credits: 4 },
    { code: "PHYS101", name: "Physics I", credits: 6 },
    { code: "CHEM101", name: "Chemistry I", credits: 6 },
    { code: "ENG201", name: "English Literature", credits: 4 },
  ];

  courses.forEach(c => {
    const code = createCourseCode(c.code);
    const credits = createCredits(c.credits);
    if (!isError(code) && !isError(credits)) {
      const course = new Course(code, c.name, credits, 30);
      enrollmentService.addCourse(course);
    }
  });

  console.log("Created 4 courses:");
  courses.forEach(c => console.log(`- ${c.code}: ${c.name} (${c.credits} credits)`));
  console.log();

  const semester = createSemester("Fall2024");
  if (isError(semester)) {
    console.error("Failed to create semester");
    return;
  }

  // Enroll in courses
  console.log("Enrolling Grace in courses...\n");

  courses.forEach((c, index) => {
    const code = createCourseCode(c.code);
    if (!isError(code) && !isError(graceId)) {
      console.log(`${index + 1}. Enrolling in ${c.code} (${c.credits} credits)`);
      
      const enrollment = enrollmentService.enrollStudent(graceId, code, semester);
      
      if (enrollment instanceof Error) {
        console.error(`Error (Expected for course 4): ${enrollment.message}\n`);
      } else {
        const graceUpdated = enrollmentService.getStudent(graceId);
        if (graceUpdated) {
          console.log(`Total credits: ${graceUpdated.getCreditsForSemester(semester)}/18\n`);
        }
      }
    }
  });

  const graceFinal = enrollmentService.getStudent(graceId);
  if (graceFinal) {
    console.log("Final status:");
    console.log(`Student: ${graceFinal.name}`);
    console.log(`Total credits for ${semester}: ${graceFinal.getCreditsForSemester(semester)}/18`);
    console.log(`Enrolled courses: ${graceFinal.getCoursesForSemester(semester).length}`);
  }

}

runScenario4();