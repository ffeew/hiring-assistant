CREATE TABLE `email_template` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`subject` text NOT NULL,
	`content` text NOT NULL,
	`variables` text,
	`is_default` integer NOT NULL,
	`is_active` integer NOT NULL,
	`usage_count` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
