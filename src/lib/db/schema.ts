import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  gmailAddress: text("gmail_address"),
  gmailAppPassword: text("gmail_app_password"),
  companyName: text("company_name"),
  jobTitle: text("job_title"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

export const jobPost = sqliteTable("job_post", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  department: text("department"),
  location: text("location"),
  employmentType: text("employment_type"), // full-time, part-time, contract, internship
  experienceLevel: text("experience_level"), // entry, mid, senior
  description: text("description").notNull(),
  requirements: text("requirements"), // JSON string of requirements array
  responsibilities: text("responsibilities"), // JSON string of responsibilities array
  benefits: text("benefits"), // JSON string of benefits array
  salaryRange: text("salary_range"),
  isActive: integer("is_active", { mode: "boolean" })
    .$defaultFn(() => true)
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export const applicant = sqliteTable("applicant", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  jobPostId: text("job_post_id")
    .references(() => jobPost.id, { onDelete: "set null" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  portfolioUrl: text("portfolio_url"),
  metadata: text("metadata"), // JSON string of AI-extracted data and additional info
  notes: text("notes"),
  status: text("status") // applied, screening, interview, offer, rejected, hired
    .$defaultFn(() => "applied")
    .notNull(),
  source: text("source") // manual, bulk_upload, api
    .$defaultFn(() => "bulk_upload")
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export const resumeFile = sqliteTable("resume_file", {
  id: text("id").primaryKey(),
  applicantId: text("applicant_id")
    .notNull()
    .references(() => applicant.id, { onDelete: "cascade" }),
  jobPostId: text("job_post_id")
    .references(() => jobPost.id, { onDelete: "set null" }),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(), // Path to the file in Cloudflare R2
  fileSize: integer("file_size"), // File size in bytes
  mimeType: text("mime_type"), // MIME type of the uploaded file
  fileHash: text("file_hash"), // SHA-256 hash of file content for deduplication
  resumeContent: text("resume_content"), // Extracted resume content in markdown format (optional)
  extractionStatus: text("extraction_status") // pending, success, failed
    .$defaultFn(() => "pending")
    .notNull(),
  extractionError: text("extraction_error"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export const emailCommunication = sqliteTable("email_communication", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  applicantId: text("applicant_id")
    .notNull()
    .references(() => applicant.id, { onDelete: "cascade" }),
  jobPostId: text("job_post_id")
    .references(() => jobPost.id, { onDelete: "set null" }),
  emailType: text("email_type").notNull(), // acknowledgment, screening, interview, offer, rejection
  subject: text("subject").notNull(),
  content: text("content").notNull(), // HTML content of the email
  sentAt: integer("sent_at", { mode: "timestamp" })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  status: text("status") // sent, failed, bounced
    .$defaultFn(() => "sent")
    .notNull(),
  errorMessage: text("error_message"),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export const interviewSession = sqliteTable("interview_session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  applicantId: text("applicant_id")
    .notNull()
    .references(() => applicant.id, { onDelete: "cascade" }),
  jobPostId: text("job_post_id")
    .notNull()
    .references(() => jobPost.id, { onDelete: "cascade" }),
  resumeFileId: text("resume_file_id")
    .references(() => resumeFile.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  status: text("status") // scheduled, in_progress, completed, cancelled
    .$defaultFn(() => "scheduled")
    .notNull(),
  startTime: integer("start_time", { mode: "timestamp" }),
  endTime: integer("end_time", { mode: "timestamp" }),
  fullTranscript: text("full_transcript"), // Complete conversation transcript
  sessionNotes: text("session_notes"), // Interviewer notes and observations
  generatedQuestions: text("generated_questions"), // JSON array of all AI-generated questions
  interviewType: text("interview_type") // screening, technical, behavioral, final
    .$defaultFn(() => "screening")
    .notNull(),
  metadata: text("metadata"), // JSON object for additional session data
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export const conversationTurn = sqliteTable("conversation_turn", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => interviewSession.id, { onDelete: "cascade" }),
  speaker: text("speaker").notNull(), // interviewer, candidate
  content: text("content").notNull(), // What was said
  timestamp: integer("timestamp", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  turnOrder: integer("turn_order").notNull(), // Sequential order in conversation
  generatedQuestions: text("generated_questions"), // JSON array of questions generated after this turn
  questionSuggestions: text("question_suggestions"), // JSON array of follow-up suggestions
  analysis: text("analysis"), // AI analysis of the turn (sentiment, topics covered, etc.)
  confidence: integer("confidence"), // Speech recognition confidence (0-100)
  duration: integer("duration"), // Duration of speaking turn in milliseconds
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const emailTemplate = sqliteTable("email_template", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category").notNull(), // acknowledgment, screening, interview, offer, rejection, follow_up
  subject: text("subject").notNull(),
  content: text("content").notNull(), // HTML content with template variables
  variables: text("variables"), // JSON array of available variables for this template
  isDefault: integer("is_default", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  isActive: integer("is_active", { mode: "boolean" })
    .$defaultFn(() => true)
    .notNull(),
  usageCount: integer("usage_count")
    .$defaultFn(() => 0)
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});
