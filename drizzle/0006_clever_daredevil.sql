CREATE TABLE `conversation_turn` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`speaker` text NOT NULL,
	`content` text NOT NULL,
	`timestamp` integer NOT NULL,
	`turn_order` integer NOT NULL,
	`generated_questions` text,
	`question_suggestions` text,
	`analysis` text,
	`confidence` integer,
	`duration` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `interview_session`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `interview_session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`applicant_id` text NOT NULL,
	`job_post_id` text NOT NULL,
	`resume_file_id` text,
	`title` text NOT NULL,
	`status` text NOT NULL,
	`start_time` integer,
	`end_time` integer,
	`full_transcript` text,
	`session_notes` text,
	`generated_questions` text,
	`interview_type` text NOT NULL,
	`metadata` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`applicant_id`) REFERENCES `applicant`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`job_post_id`) REFERENCES `job_post`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`resume_file_id`) REFERENCES `resume_file`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_resume_file` (
	`id` text PRIMARY KEY NOT NULL,
	`applicant_id` text NOT NULL,
	`job_post_id` text,
	`file_name` text NOT NULL,
	`file_path` text NOT NULL,
	`file_size` integer,
	`mime_type` text,
	`file_hash` text,
	`resume_content` text,
	`extraction_status` text NOT NULL,
	`extraction_error` text,
	`created_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`applicant_id`) REFERENCES `applicant`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`job_post_id`) REFERENCES `job_post`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_resume_file`("id", "applicant_id", "job_post_id", "file_name", "file_path", "file_size", "mime_type", "file_hash", "resume_content", "extraction_status", "extraction_error", "created_at", "deleted_at") SELECT "id", "applicant_id", "job_post_id", "file_name", "file_path", "file_size", "mime_type", "file_hash", "resume_content", "extraction_status", "extraction_error", "created_at", "deleted_at" FROM `resume_file`;--> statement-breakpoint
DROP TABLE `resume_file`;--> statement-breakpoint
ALTER TABLE `__new_resume_file` RENAME TO `resume_file`;--> statement-breakpoint
PRAGMA foreign_keys=ON;