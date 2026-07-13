ALTER TABLE `endpoints` ADD `verify_enabled` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `endpoints` ADD `verify_token` text;