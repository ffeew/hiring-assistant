CREATE TABLE `job_post` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`department` text,
	`location` text,
	`employment_type` text,
	`experience_level` text,
	`description` text NOT NULL,
	`requirements` text,
	`responsibilities` text,
	`benefits` text,
	`salary_range` text,
	`is_active` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
