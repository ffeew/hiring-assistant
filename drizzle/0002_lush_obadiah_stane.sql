CREATE TABLE `applicant` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`job_post_id` text,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`linkedin_url` text,
	`github_url` text,
	`portfolio_url` text,
	`metadata` text,
	`notes` text,
	`status` text NOT NULL,
	`source` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`job_post_id`) REFERENCES `job_post`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `email_communication` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`applicant_id` text NOT NULL,
	`job_post_id` text,
	`email_type` text NOT NULL,
	`subject` text NOT NULL,
	`content` text NOT NULL,
	`sent_at` integer NOT NULL,
	`status` text NOT NULL,
	`error_message` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`applicant_id`) REFERENCES `applicant`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`job_post_id`) REFERENCES `job_post`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `resume_file` (
	`id` text PRIMARY KEY NOT NULL,
	`applicant_id` text NOT NULL,
	`file_name` text NOT NULL,
	`resume_content` text NOT NULL,
	`extraction_status` text NOT NULL,
	`extraction_error` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`applicant_id`) REFERENCES `applicant`(`id`) ON UPDATE no action ON DELETE cascade
);
