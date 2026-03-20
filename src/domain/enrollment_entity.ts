
import { BaseEntity } from "./base_entity";
import {
  EnrollmentId,
  StudentId,
  CourseCode,
  Semester,
} from "./branded_types";

export type EnrollmentStatus = "active" | "cancelled";

export class Enrollment extends BaseEntity<EnrollmentId> {
  private readonly _studentId: StudentId;
  private readonly _courseCode: CourseCode;
  private readonly _semester: Semester;
  private readonly _status: EnrollmentStatus;
  private readonly _enrolledAt: Date;
  private readonly _cancelledAt?: Date;

  constructor(
    id: EnrollmentId,
    studentId: StudentId,
    courseCode: CourseCode,
    semester: Semester,
    status: EnrollmentStatus = "active",
    enrolledAt: Date = new Date(),
    cancelledAt?: Date
  ) {
    super(id);
    this._studentId = studentId;
    this._courseCode = courseCode;
    this._semester = semester;
    this._status = status;
    this._enrolledAt = enrolledAt;
    this._cancelledAt = cancelledAt;
  }

  get studentId(): StudentId {
    return this._studentId;
  }

  get courseCode(): CourseCode {
    return this._courseCode;
  }

  get semester(): Semester {
    return this._semester;
  }

  get status(): EnrollmentStatus {
    return this._status;
  }

  get enrolledAt(): Date {
    return this._enrolledAt;
  }

  get cancelledAt(): Date | undefined {
    return this._cancelledAt;
  }

  isActive(): boolean {
    return this._status === "active";
  }

  isCancelled(): boolean {
    return this._status === "cancelled";
  }

  cancel(): Enrollment | Error {
    if (this.isCancelled()) {
      return new Error(
        `Enrollment ${this.id} is already cancelled`
      );
    }

    return new Enrollment(
      this._id,
      this._studentId,
      this._courseCode,
      this._semester,
      "cancelled",
      this._enrolledAt,
      new Date()
    );
  }

  matches(
    studentId: StudentId,
    courseCode: CourseCode,
    semester: Semester
  ): boolean {
    return (
      this._studentId === studentId &&
      this._courseCode === courseCode &&
      this._semester === semester
    );
  }

  getSummary(): string {
    const statusText = this.isActive() ? "ACTIVE" : "CANCELLED";
    const cancelledInfo = this.isCancelled()
      ? ` | Cancelled: ${this.cancelledAt?.toISOString()}`
      : "";

    return `Enrollment ${this.id}\n  Student: ${this.studentId} | Course: ${this.courseCode} | Semester: ${this.semester}\n  Status: ${statusText} | Enrolled: ${this.enrolledAt.toISOString()}${cancelledInfo}`;
  }
}

export function findDuplicateEnrollment(
  enrollments: Enrollment[],
  studentId: StudentId,
  courseCode: CourseCode,
  semester: Semester
): Enrollment | undefined {
  return enrollments.find(
    (enrollment) =>
      enrollment.isActive() &&
      enrollment.matches(studentId, courseCode, semester)
  );
}

