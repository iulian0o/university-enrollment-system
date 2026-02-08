# University Enrollment System 🎓

**Course:** Advanced JavaScript @ EPITA  
**Module:** Domain-Driven Design & Software Architecture

## 📖 Overview

Welcome to the **University Enrollment System**. This project simulates a real-world scenario where you are tasked with refactoring a legacy "spaghetti code" application into a robust, scalable system using **Domain-Driven Design (DDD)** principles.

The goal is not just to make the code "work," but to make it **maintainable**, **testable**, and **aligned with business rules**.

### The Architecture Goal

We are moving away from "Controller-Heavy" logic toward a **Modular Monolith** (or Hexagonal) architecture.

[Image of hexagonal architecture diagram]

---

## 📂 Project Structure

This repository is organized as a monorepo:

```text
/
├── backend/          # Node.js, Express, TypeScript, SQLite
│   ├── src/
│   │   ├── server.ts # Main entry point
│   └── SPECS.md      # 📜 The "Ubiquitous Language" & Business Rules
│
├── frontend/         # Simple Client to test API
│   └── ...
│
└── README.md         # This file
```

## 📖 Specifications

Read the specifications in the [SPECS.md](SPECS.md) file for details on the requirements and business rules of the system.

## 🚀 Getting Started

1. Clone the repository.
2. Navigate to the `backend` directory.
3. Run `npm install` to install dependencies.
4. Run `npm run dev` to start the development server.
5. Open a web browser and navigate to `http://localhost:3000`.
6. Interact with the API to create, read, update, and delete students and enrollments.
7. Run `npm run build` to build the production version.
8. Run `npm run start` to start the production server.
9. Open a web browser and navigate to `http://localhost:3000`.

## 📚 Resources

- [Domain-Driven Design](https://martinfowler.com/eaaDev/DomainDrivenDesign.html)
- [Modular Monolith](https://martinfowler.com/bliki/ModularMonolith.html)
- [Hexagonal Architecture](https://martinfowler.com/bliki/HexagonalArchitecture.html)
- [Clean Architecture](https://www.clean-architecture.net/)
- [Clean Code](https://www.clean-code.com/en/)
- [DDD](https://dddbook.io/)
- [DDD Book](https://dddbook.io/)
- [DDD by Example](https://dddbyexample.com/)

## 📝 License

This project is licensed under the [MIT License](LICENSE).
