
import { Student } from "./student.entity";
import { Course } from "./course.entity";
import { Enrollment, findDuplicateEnrollment } from "./enrollment.entity";
import { EventEmitter } from "../infrastructure/event-emitter";
import {
  createStudentEnrolledEvent,
  createEnrollmentCancelledEvent,
  createCourseCapacityReachedEvent,
  createCourseFullEvent,
} from "./events";
import {
  EnrollmentId,
  StudentId,
  CourseCode,
  Semester,
  generateEnrollmentId,
} from "./branded-types";

export class EnrollmentService {
  private eventEmitter: EventEmitter;
  private students: Map<StudentId, Student>;
  private courses: Map<CourseCode, Course>;
  private enrollments: Map<EnrollmentId, Enrollment>;

  constructor(eventEmitter: EventEmitter) {
    this.eventEmitter = eventEmitter;
    this.students = new Map();
    this.courses = new Map();
    this.enrollments = new Map();
  }

  addStudent(student: Student): void {
    this.students.set(student.id, student);
  }

  addCourse(course: Course): void {
    this.courses.set(course.code, course);
  }

  getStudent(studentId: StudentId): Student | undefined {
    return this.students.get(studentId);
  }

  getCourse(courseCode: CourseCode): Course | undefined {
    return this.courses.get(courseCode);
  }

  getEnrollment(enrollmentId: EnrollmentId): Enrollment | undefined {
    return this.enrollments.get(enrollmentId);
  }

  getActiveEnrollments(): Enrollment[] {
    return Array.from(this.enrollments.values()).filter((e) => e.isActive());
  }

  enrollStudent(
    studentId: StudentId,
    courseCode: CourseCode,
    semester: Semester
  ): Enrollment | Error {
    const student = this.getStudent(studentId);
    if (!student) {
      return new Error(`Student ${studentId} not found`);
    }

    const course = this.getCourse(courseCode);
    if (!course) {
      return new Error(`Course ${courseCode} not found`);
    }

    if (course.isFull()) {
      return new Error(
        `Cannot enroll: Course ${courseCode} (${course.name}) is full`
      );
    }

    if (student.wouldExceedCreditLimit(semester, course.credits)) {
      const currentCredits = student.getCreditsForSemester(semester);
      return new Error(
        `Cannot enroll: Student ${studentId} would exceed 18-credit limit for ${semester}. Current: ${currentCredits}, Course: ${course.credits}, Total would be: ${
          currentCredits + course.credits
        }`
      );
    }

    const existingEnrollments = this.getActiveEnrollments();
    const duplicate = findDuplicateEnrollment(
      existingEnrollments,
      studentId,
      courseCode,
      semester
    );
    if (duplicate) {
      return new Error(
        `Student ${studentId} is already enrolled in course ${courseCode} for ${semester}`
      );
    }

    const wasBelow80 = !course.hasReached80PercentCapacity();
    const updatedCourseResult = course.incrementEnrolledCount();
    if (updatedCourseResult instanceof Error) {
      return updatedCourseResult;
    }
    const updatedCourse = updatedCourseResult;
    this.courses.set(courseCode, updatedCourse);

    const updatedStudentResult = student.addEnrollment(
      courseCode,
      semester,
      course.credits
    );
    if (updatedStudentResult instanceof Error) {
      this.courses.set(courseCode, course);
      return updatedStudentResult;
    }
    const updatedStudent = updatedStudentResult;
    this.students.set(studentId, updatedStudent);

    const enrollmentId = generateEnrollmentId();
    const enrollment = new Enrollment(
      enrollmentId,
      studentId,
      courseCode,
      semester,
      "active"
    );
    this.enrollments.set(enrollmentId, enrollment);

    const studentEnrolledEvent = createStudentEnrolledEvent(
      studentId,
      student.name,
      courseCode,
      course.name,
      semester,
      course.credits,
      enrollmentId
    );
    this.eventEmitter.emit("StudentEnrolled", studentEnrolledEvent);

    if (updatedCourse.isFull()) {
      const courseFullEvent = createCourseFullEvent(
        courseCode,
        course.name,
        course.capacity
      );
      this.eventEmitter.emit("CourseFull", courseFullEvent);
    } else if (wasBelow80 && updatedCourse.hasReached80PercentCapacity()) {
      const capacityEvent = createCourseCapacityReachedEvent(
        courseCode,
        course.name,
        updatedCourse.enrolledCount,
        course.capacity
      );
      this.eventEmitter.emit("CourseCapacityReached", capacityEvent);
    }

    return enrollment;
  }

  cancelEnrollment(enrollmentId: EnrollmentId): Enrollment | Error {
    const enrollment = this.getEnrollment(enrollmentId);
    if (!enrollment) {
      return new Error(`Enrollment ${enrollmentId} not found`);
    }

    if (!enrollment.isActive()) {
      return new Error(`Enrollment ${enrollmentId} is already cancelled`);
    }

    const student = this.getStudent(enrollment.studentId);
    const course = this.getCourse(enrollment.courseCode);

    if (!student || !course) {
      return new Error(
        `Cannot cancel enrollment: student or course not found`
      );
    }

    const updatedCourseResult = course.decrementEnrolledCount();
    if (updatedCourseResult instanceof Error) {
      return updatedCourseResult;
    }
    this.courses.set(course.code, updatedCourseResult);

    const updatedStudentResult = student.removeEnrollment(
      enrollment.courseCode,
      enrollment.semester,
      course.credits
    );
    if (updatedStudentResult instanceof Error) {
      this.courses.set(course.code, course);
      return updatedStudentResult;
    }
    this.students.set(student.id, updatedStudentResult);

    const cancelledEnrollmentResult = enrollment.cancel();
    if (cancelledEnrollmentResult instanceof Error) {
      return cancelledEnrollmentResult;
    }
    const cancelledEnrollment = cancelledEnrollmentResult;
    this.enrollments.set(enrollmentId, cancelledEnrollment);

    const cancelledEvent = createEnrollmentCancelledEvent(
      enrollmentId,
      enrollment.studentId,
      enrollment.courseCode,
      enrollment.semester,
      course.credits
    );
    this.eventEmitter.emit("EnrollmentCancelled", cancelledEvent);

    return cancelledEnrollment;
  }

  getStatistics(): {
    totalStudents: number;
    totalCourses: number;
    totalEnrollments: number;
    activeEnrollments: number;
    cancelledEnrollments: number;
  } {
    const allEnrollments = Array.from(this.enrollments.values());
    const activeEnrollments = allEnrollments.filter((e) => e.isActive()).length;
    const cancelledEnrollments = allEnrollments.filter((e) =>
      e.isCancelled()
    ).length;

    return {
      totalStudents: this.students.size,
      totalCourses: this.courses.size,
      totalEnrollments: this.enrollments.size,
      activeEnrollments,
      cancelledEnrollments,
    };
  }
}

