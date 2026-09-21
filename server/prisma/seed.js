"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
    // Clean existing data in reverse relation order
    await prisma.attemptAnswer.deleteMany();
    await prisma.assessmentAttempt.deleteMany();
    await prisma.questionOption.deleteMany();
    await prisma.question.deleteMany();
    await prisma.assessment.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.participant.deleteMany();
    await prisma.user.deleteMany();
    const passwordHash = await bcryptjs_1.default.hash('password123', 10);
    // 1. Create Admin User
    const admin = await prisma.user.create({
        data: {
            name: 'Admin User',
            email: 'admin@assesspulse.com',
            passwordHash,
            role: client_1.UserRole.ADMIN,
            organization: 'AssessPulse HQ',
        },
    });
    // 2. Create Test Creator User
    const creator = await prisma.user.create({
        data: {
            name: 'Jane Creator',
            email: 'creator@assesspulse.com',
            passwordHash,
            role: client_1.UserRole.TEST_CREATOR,
            organization: 'Cloud Engineering Academy',
        },
    });
    // 3. Create Sample Participant User
    await prisma.user.create({
        data: {
            name: 'Alex Student',
            email: 'student@assesspulse.com',
            passwordHash,
            role: client_1.UserRole.PARTICIPANT,
            organization: 'Tech University',
        },
    });
    // 4. Create Sample Assessment
    const assessment = await prisma.assessment.create({
        data: {
            title: 'Full-Stack Web Development & Cloud Architecture Assessment',
            description: 'Comprehensive evaluation test covering TypeScript, React, REST API design, PostgreSQL queries, Docker, and Cloud Native Security practices.',
            category: 'Software Engineering',
            instructions: 'Read every question carefully. For multiple choice questions, all correct options must be selected. Time limit is 30 minutes.',
            accessCode: 'DEV2026',
            status: client_1.AssessmentStatus.ACTIVE,
            timeLimitMinutes: 30,
            passingScorePercentage: 75,
            maxAttempts: 3,
            shuffleQuestions: false,
            shuffleOptions: false,
            showImmediateResults: true,
            allowAnswerReview: true,
            requireParticipantEmail: true,
            requireParticipantId: false,
            enableAntiCheatWarnings: true,
            creatorId: creator.id,
        },
    });
    // 5. Create Sample Questions
    // Q1: SINGLE_CHOICE
    const q1 = await prisma.question.create({
        data: {
            assessmentId: assessment.id,
            text: 'Which HTTP method should be used to apply partial modifications to a resource according to REST conventions?',
            type: client_1.QuestionType.SINGLE_CHOICE,
            marks: 2,
            order: 1,
            explanation: 'PATCH applies partial modifications, whereas PUT typically replaces the entire resource.',
            isRequired: true,
            options: {
                create: [
                    { text: 'PUT', isCorrect: false, order: 0 },
                    { text: 'PATCH', isCorrect: true, order: 1 },
                    { text: 'POST', isCorrect: false, order: 2 },
                    { text: 'CONNECT', isCorrect: false, order: 3 },
                ],
            },
        },
    });
    // Q2: MULTIPLE_CHOICE
    const q2 = await prisma.question.create({
        data: {
            assessmentId: assessment.id,
            text: 'Which of the following are ACID properties in relational database management systems? (Select all that apply)',
            type: client_1.QuestionType.MULTIPLE_CHOICE,
            marks: 3,
            order: 2,
            explanation: 'ACID stands for Atomicity, Consistency, Isolation, and Durability.',
            isRequired: true,
            options: {
                create: [
                    { text: 'Atomicity', isCorrect: true, order: 0 },
                    { text: 'Availability', isCorrect: false, order: 1 },
                    { text: 'Isolation', isCorrect: true, order: 2 },
                    { text: 'Durability', isCorrect: true, order: 3 },
                ],
            },
        },
    });
    // Q3: TRUE_FALSE
    const q3 = await prisma.question.create({
        data: {
            assessmentId: assessment.id,
            text: 'In PostgreSQL, an index scan is always faster than a sequential scan regardless of the table size.',
            type: client_1.QuestionType.TRUE_FALSE,
            marks: 2,
            order: 3,
            explanation: 'False. For very small tables or queries fetching a large fraction of the table, sequential scans are often faster because they avoid random I/O.',
            isRequired: true,
            options: {
                create: [
                    { text: 'True', isCorrect: false, order: 0 },
                    { text: 'False', isCorrect: true, order: 1 },
                ],
            },
        },
    });
    // Q4: SHORT_ANSWER
    const q4 = await prisma.question.create({
        data: {
            assessmentId: assessment.id,
            text: 'What type of token is used in stateless authentication to securely transmit information between parties as a JSON object?',
            type: client_1.QuestionType.SHORT_ANSWER,
            marks: 3,
            order: 4,
            explanation: 'JSON Web Token (JWT) is the standard format.',
            isRequired: true,
            options: {
                create: [
                    { text: 'jwt', isCorrect: true, order: 0 },
                    { text: 'json web token', isCorrect: true, order: 1 },
                ],
            },
        },
    });
    // Q5: LONG_ANSWER
    const q5 = await prisma.question.create({
        data: {
            assessmentId: assessment.id,
            text: 'Explain the difference between optimistic concurrency control and pessimistic locking in database transactions.',
            type: client_1.QuestionType.LONG_ANSWER,
            marks: 5,
            order: 5,
            explanation: 'Optimistic concurrency checks for conflicts before committing (e.g. via version field), while pessimistic locking locks the row/table immediately to prevent concurrent modifications.',
            isRequired: true,
            options: {
                create: [],
            },
        },
    });
    // 6. Create Sample Participant & Completed Attempt for Initial Analytics
    const participant = await prisma.participant.create({
        data: {
            name: 'Samira Patel',
            email: 'samira@example.com',
            studentId: 'STU-9921',
            organization: 'Global Tech Corp',
        },
    });
    const opt1 = await prisma.questionOption.findFirst({ where: { questionId: q1.id, isCorrect: true } });
    const opt2Corrects = await prisma.questionOption.findMany({ where: { questionId: q2.id, isCorrect: true } });
    const opt3 = await prisma.questionOption.findFirst({ where: { questionId: q3.id, isCorrect: true } });
    const attempt = await prisma.assessmentAttempt.create({
        data: {
            assessmentId: assessment.id,
            participantId: participant.id,
            status: 'COMPLETED',
            startedAt: new Date(Date.now() - 25 * 60 * 1000),
            submittedAt: new Date(),
            timeSpentSeconds: 1240,
            totalMarks: 15,
            earnedMarks: 15,
            scorePercentage: 100,
            isPassed: true,
            tabSwitchCount: 0,
            answers: {
                create: [
                    {
                        questionId: q1.id,
                        selectedOptionIds: opt1 ? [opt1.id] : [],
                        isCorrect: true,
                        marksAwarded: 2,
                        answeredAt: new Date(),
                    },
                    {
                        questionId: q2.id,
                        selectedOptionIds: opt2Corrects.map((o) => o.id),
                        isCorrect: true,
                        marksAwarded: 3,
                        answeredAt: new Date(),
                    },
                    {
                        questionId: q3.id,
                        selectedOptionIds: opt3 ? [opt3.id] : [],
                        isCorrect: true,
                        marksAwarded: 2,
                        answeredAt: new Date(),
                    },
                    {
                        questionId: q4.id,
                        textAnswer: 'JWT',
                        isCorrect: true,
                        marksAwarded: 3,
                        answeredAt: new Date(),
                    },
                    {
                        questionId: q5.id,
                        textAnswer: 'Optimistic concurrency checks version numbers at commit time without blocking reads/writes, while pessimistic locking holds exclusive row locks during the transaction lifetime.',
                        isCorrect: true,
                        marksAwarded: 5,
                        answeredAt: new Date(),
                    },
                ],
            },
        },
    });
    console.log('✅ Database seeded successfully:');
    console.log(`- Admin: admin@assesspulse.com (password123)`);
    console.log(`- Creator: creator@assesspulse.com (password123)`);
    console.log(`- Participant: student@assesspulse.com (password123)`);
    console.log(`- Sample Assessment: ${assessment.title} (Access Code: ${assessment.accessCode})`);
    console.log(`- Seeded Attempt ID: ${attempt.id}`);
}
main()
    .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map