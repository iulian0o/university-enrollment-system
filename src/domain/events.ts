import { DomainEvent } from "../infrastructure/event_emitter";
import {
  StudentId,
  CourseCode,
  Semester,
  EnrollmentId,
  Credits,
} from "./branded_types";

// StudentEnrolled Event
// Emitted when a student successfully enrolls in a course

export interface StudentEnrolledEvent extends DomainEvent {
  readonly eventType: "StudentEnrolled";
  readonly studentId: StudentId;
  readonly studentName: string;
  readonly courseCode: CourseCode;
  readonly courseName: string;
  readonly semester: Semester;
  readonly credits: Credits;
  readonly enrollmentId: EnrollmentId;
}

export function createStudentEnrolledEvent(
  studentId: StudentId,
  studentName: string,
  courseCode: CourseCode,
  courseName: string,
  semester: Semester,
  credits: Credits,
  enrollmentId: EnrollmentId
): StudentEnrolledEvent {
  return {
    eventType: "StudentEnrolled",
    occurredAt: new Date(),
    studentId,
    studentName,
    courseCode,
    courseName,
    semester,
    credits,
    enrollmentId,
  };
}

export interface EnrollmentCancelledEvent extends DomainEvent {
  readonly eventType: "EnrollmentCancelled";
  readonly enrollmentId: EnrollmentId;
  readonly studentId: StudentId;
  readonly courseCode: CourseCode;
  readonly semester: Semester;
  readonly creditsReleased: Credits;
}

export function createEnrollmentCancelledEvent(
  enrollmentId: EnrollmentId,
  studentId: StudentId,
  courseCode: CourseCode,
  semester: Semester,
  creditsReleased: Credits
): EnrollmentCancelledEvent {
  return {
    eventType: "EnrollmentCancelled",
    occurredAt: new Date(),
    enrollmentId,
    studentId,
    courseCode,
    semester,
    creditsReleased,
  };
}

// Emitted when a course reaches 80% capacity

export interface CourseCapacityReachedEvent extends DomainEvent {
  readonly eventType: "CourseCapacityReached";
  readonly courseCode: CourseCode;
  readonly courseName: string;
  readonly enrolledCount: number;
  readonly capacity: number;
  readonly percentage: number;
}

export function createCourseCapacityReachedEvent(
  courseCode: CourseCode,
  courseName: string,
  enrolledCount: number,
  capacity: number
): CourseCapacityReachedEvent {
  return {
    eventType: "CourseCapacityReached",
    occurredAt: new Date(),
    courseCode,
    courseName,
    enrolledCount,
    capacity,
    percentage: Math.round((enrolledCount / capacity) * 100),
  };
}

// CourseFull Event, emitted when a course reaches 100% capacity

export interface CourseFullEvent extends DomainEvent {
  readonly eventType: "CourseFull";
  readonly courseCode: CourseCode;
  readonly courseName: string;
  readonly capacity: number;
}

export function createCourseFullEvent(
  courseCode: CourseCode,
  courseName: string,
  capacity: number
): CourseFullEvent {
  return {
    eventType: "CourseFull",
    occurredAt: new Date(),
    courseCode,
    courseName,
    capacity,
  };
}

// Union Type of All Domain Events, useful for type-safe event handling cuz we proffesionals

export type DomainEventUnion =
  | StudentEnrolledEvent
  | EnrollmentCancelledEvent
  | CourseCapacityReachedEvent
  | CourseFullEvent;