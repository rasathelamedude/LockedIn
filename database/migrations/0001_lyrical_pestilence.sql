PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_focus_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`goal_id` text NOT NULL,
	`start_time` integer NOT NULL,
	`end_time` integer,
	`duration_minutes` real,
	`status` text DEFAULT 'active' NOT NULL,
	`notes` text,
	FOREIGN KEY (`goal_id`) REFERENCES `goals`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_focus_sessions`("id", "goal_id", "start_time", "end_time", "duration_minutes", "status", "notes") SELECT "id", "goal_id", "start_time", "end_time", "duration_minutes", "status", "notes" FROM `focus_sessions`;--> statement-breakpoint
DROP TABLE `focus_sessions`;--> statement-breakpoint
ALTER TABLE `__new_focus_sessions` RENAME TO `focus_sessions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;