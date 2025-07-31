DROP INDEX "session_token_unique";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
ALTER TABLE `resume_file` ALTER COLUMN "resume_content" TO "resume_content" text;--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
ALTER TABLE `resume_file` ADD `file_path` text NOT NULL;--> statement-breakpoint
ALTER TABLE `resume_file` ADD `file_size` integer;--> statement-breakpoint
ALTER TABLE `resume_file` ADD `mime_type` text;--> statement-breakpoint
ALTER TABLE `resume_file` ADD `file_hash` text;--> statement-breakpoint
ALTER TABLE `resume_file` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `applicant` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `email_communication` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `job_post` ADD `deleted_at` integer;