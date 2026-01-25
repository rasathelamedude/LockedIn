CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL,
	`context_snapshot` text
);
--> statement-breakpoint
CREATE TABLE `daily_progress` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`streak_count` integer DEFAULT 1 NOT NULL,
	`total_minutes` real DEFAULT 0 NOT NULL,
	`goals_worked_on` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `daily_progress_date_unique` ON `daily_progress` (`date`);--> statement-breakpoint
CREATE TABLE `focus_sessions` (
	`id` text NOT NULL,
	`start_time` integer NOT NULL,
	`end_time` integer,
	`duration_minutes` real,
	`status` text DEFAULT 'active' NOT NULL,
	`notes` text,
	FOREIGN KEY (`id`) REFERENCES `goals`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `goals` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`target_hours` real NOT NULL,
	`hours_logged` real DEFAULT 0 NOT NULL,
	`deadline` integer,
	`status` text DEFAULT 'active' NOT NULL,
	`color` text DEFAULT '#3b82f6' NOT NULL,
	`efficiency` real,
	`created_at` integer NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `goals_title_unique` ON `goals` (`title`);--> statement-breakpoint
CREATE TABLE `milestones` (
	`id` text PRIMARY KEY NOT NULL,
	`goal_id` text NOT NULL,
	`title` text NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`completed_at` integer,
	`order_index` integer NOT NULL,
	FOREIGN KEY (`goal_id`) REFERENCES `goals`(`id`) ON UPDATE no action ON DELETE cascade
);
