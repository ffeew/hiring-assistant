PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_resume_file` (
	`id` text PRIMARY KEY NOT NULL,
	`applicant_id` text NOT NULL,
	`job_post_id` text NOT NULL,
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