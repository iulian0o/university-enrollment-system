import { BaseEntity } from "./base_entity";
import {
  StudentId,
  CourseCode,
  Email,
  Credits,
  Semester,
} from "./branded_types";

export class Student extends BaseEntity<StudentId> {
  private readonly _name: string;
  private readonly _email: Email;
  // Map of semester to credits enrolled
  private _creditsBySemester: Map<Semester, number>;
  // Map of semester to array of course codes
  private _coursesBySemester: Map<Semester, CourseCode[]>;

  constructor(
    id: StudentId,
    name: string,
    email: Email,
    creditsBySemester: Map<Semester, number> = new Map(),
    coursesBySemester: Map<Semester, CourseCode[]> = new Map()
  ) {
    super(id);
    this._name = name;
    this._email = email;
    this._creditsBySemester = new Map(creditsBySemester);
    this._coursesBySemester = new Map(coursesBySemester);
  }

  // Getters

  get name(): string {
    return this._name;
  }

  get email(): Email {
    return this._email;
  }

  getCreditsForSemester(semester: Semester): number {
    return this._creditsBySemester.get(semester) || 0;
  }

  getCoursesForSemester(semester: Semester): CourseCode[] {
    return this._coursesBySemester.get(semester) || [];
  }

  getAllSemesters(): Semester[] {
    return Array.from(this._creditsBySemester.keys());
  }

  wouldExceedCreditLimit(
    semester: Semester,
    additionalCredits: Credits
  ): boolean {
    const currentCredits = this.getCreditsForSemester(semester);
    const newTotal = currentCredits + additionalCredits;
    return newTotal > 18;
  }

  isEnrolledInCourse(courseCode: CourseCode, semester: Semester): boolean {
    const courses = this.getCoursesForSemester(semester);
    return courses.includes(courseCode);
  }

  addEnrollment(
    courseCode: CourseCode,
    semester: Semester,
    credits: Credits
  ): Student | Error {
    // Check credit limit
    if (this.wouldExceedCreditLimit(semester, credits)) {
      const current = this.getCreditsForSemester(semester);
      return new Error(
        `Cannot enroll: would exceed 18-credit limit. Current: ${current}, Attempting to add: ${credits}, Total would be: ${
          current + credits
        }`
      );
    }

    // Check duplicate enrollment
    if (this.isEnrolledInCourse(courseCode, semester)) {
      return new Error(
        `Student ${this.id} is already enrolled in course ${courseCode} for ${semester}`
      );
    }

    // Create new maps with the enrollment added
    const newCreditsBySemester = new Map(this._creditsBySemester);
    const currentCredits = this.getCreditsForSemester(semester);
    newCreditsBySemester.set(semester, currentCredits + credits);

    const newCoursesBySemester = new Map(this._coursesBySemester);
    const currentCourses = this.getCoursesForSemester(semester);
    newCoursesBySemester.set(semester, [...currentCourses, courseCode]);

    // Return new instance
    return new Student(
      this._id,
      this._name,
      this._email,
      newCreditsBySemester,
      newCoursesBySemester
    );
  }

  removeEnrollment(
    courseCode: CourseCode,
    semester: Semester,
    credits: Credits
  ): Student | Error {
    // Check if enrolled
    if (!this.isEnrolledInCourse(courseCode, semester)) {
      return new Error(
        `Student ${this.id} is not enrolled in course ${courseCode} for ${semester}`
      );
    }

    // Create new maps with the enrollment removed
    const newCreditsBySemester = new Map(this._creditsBySemester);
    const currentCredits = this.getCreditsForSemester(semester);
    const newCredits = currentCredits - credits;

    if (newCredits === 0) {
      newCreditsBySemester.delete(semester);
    } else {
      newCreditsBySemester.set(semester, newCredits);
    }

    const newCoursesBySemester = new Map(this._coursesBySemester);
    const currentCourses = this.getCoursesForSemester(semester);
    const newCourses = currentCourses.filter((c) => c !== courseCode);

    if (newCourses.length === 0) {
      newCoursesBySemester.delete(semester);
    } else {
      newCoursesBySemester.set(semester, newCourses);
    }

    // Return new instance
    return new Student(
      this._id,
      this._name,
      this._email,
      newCreditsBySemester,
      newCoursesBySemester
    );
  }

  getSummary(): string {
    const semesters = this.getAllSemesters();
    if (semesters.length === 0) {
      return `${this.name} (${this.id}) - No enrollments`;
    }

    const semesterSummaries = semesters.map((semester) => {
      const credits = this.getCreditsForSemester(semester);
      const courses = this.getCoursesForSemester(semester);
      return `  ${semester}: ${credits} credits in ${courses.length} course(s)`;
    });

    return `${this.name} (${this.id})\n${semesterSummaries.join("\n")}`;
  }
}
