export type Brand<K, T> = K & {__brand: T};
export type StudentId = Brand<string, "StudentId">;

export function createStudentId(value: string): StudentId | Error {
  const pattern = /^STU\d{6}$/;
  
  if (!pattern.test(value)) {
    return new Error(
      `Invalid StudentId format: "${value}". Expected format: STU followed by 6 digits (e.g., STU123456)`
    );
  }
  
  return value as StudentId;
}

export type CourseCode = Brand<string, "CourseCode">;

export function createCourseCode(value: string): CourseCode | Error {
  const pattern = /^[A-Z]{2,4}\d{3}$/;
  
  if (!pattern.test(value)) {
    return new Error(
      `Invalid CourseCode format: "${value}". Expected format: 2-4 uppercase letters followed by 3 digits (e.g., CS101, MATH203)`
    );
  }
  
  return value as CourseCode;
}

// Email valid format

export type Email = Brand<string, "Email">;

export function createEmail(value: string): Email | Error {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!pattern.test(value)) {
    return new Error(
      `Invalid Email format: "${value}". Expected a valid email address (e.g., student@epita.fr)`
    );
  }
  
  return value as Email;
}

// Credits format

export type Credits = Brand<number, "Credits">;

export function createCredits(value: number): Credits | Error {
  const validCredits = [1, 2, 3, 4, 6];
  
  if (!validCredits.includes(value)) {
    return new Error(
      `Invalid Credits value: ${value}. Credits must be one of: ${validCredits.join(", ")}`
    );
  }
  
  return value as Credits;
}

// Semester format

export type Semester = Brand<string, "Semester">;

export function createSemester(value: string): Semester | Error {
  const pattern = /^(Fall|Spring|Summer)\d{4}$/;
  
  if (!pattern.test(value)) {
    return new Error(
      `Invalid Semester format: "${value}". Expected format: (Fall|Spring|Summer) followed by year (e.g., Fall2024, Spring2025)`
    );
  }
  
  const year = parseInt(value.slice(-4));
  if (year < 2000 || year > 2100) {
    return new Error(
      `Invalid Semester year: ${year}. Year must be between 2000 and 2100`
    );
  }
  
  return value as Semester;
}

// Enrollment Id

export type EnrollmentId = Brand<string, "EnrollmentId">;

export function createEnrollmentId(value: string): EnrollmentId | Error {
  const pattern = /^ENR-.+$/;
  
  if (!pattern.test(value)) {
    return new Error(
      `Invalid EnrollmentId format: "${value}". Expected format: ENR- followed by unique identifier (e.g., ENR-abc123)`
    );
  }
  
  return value as EnrollmentId;
}

export function generateEnrollmentId(): EnrollmentId {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  const id = `ENR-${timestamp}-${random}`;
  
  return id as EnrollmentId;
}

export function unwrap<K, T>(branded: Brand<K, T>): K {
  return branded as K;
}

export function isError(value: unknown): value is Error {
  return value instanceof Error;
}