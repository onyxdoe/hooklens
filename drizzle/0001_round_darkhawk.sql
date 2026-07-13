CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_user_id_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_user_id_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`endpoint_id` text NOT NULL,
	`method` text NOT NULL,
	`headers` text NOT NULL,
	`query` text NOT NULL,
	`body` text,
	`content_type` text,
	`client_ip` text,
	`user_agent` text,
	`size_bytes` integer NOT NULL,
	`latency_ms` integer NOT NULL,
	`forward_status` integer,
	`forward_error` text,
	`forward_ms` integer,
	FOREIGN KEY (`endpoint_id`) REFERENCES `endpoints`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_requests`("id", "created_at", "updated_at", "endpoint_id", "method", "headers", "query", "body", "content_type", "client_ip", "user_agent", "size_bytes", "latency_ms", "forward_status", "forward_error", "forward_ms") SELECT "id", "created_at", "updated_at", "endpoint_id", "method", "headers", "query", "body", "content_type", "client_ip", "user_agent", "size_bytes", "latency_ms", "forward_status", "forward_error", "forward_ms" FROM `requests`;--> statement-breakpoint
DROP TABLE `requests`;--> statement-breakpoint
ALTER TABLE `__new_requests` RENAME TO `requests`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `requests_endpoint_id_idx` ON `requests` (`endpoint_id`);--> statement-breakpoint
CREATE INDEX `requests_created_at_idx` ON `requests` (`created_at`);--> statement-breakpoint
ALTER TABLE `endpoints` ADD `name` text;--> statement-breakpoint
UPDATE `endpoints` SET `name` = `id` WHERE `name` IS NULL;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_endpoints` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`name` text NOT NULL,
	`user_id` text,
	`forward_enabled` integer DEFAULT false NOT NULL,
	`forward_url` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_endpoints`("id", "created_at", "updated_at", "name", "user_id", "forward_enabled", "forward_url") SELECT "id", "created_at", "updated_at", "name", NULL, "forward_enabled", "forward_url" FROM `endpoints`;--> statement-breakpoint
DROP TABLE `endpoints`;--> statement-breakpoint
ALTER TABLE `__new_endpoints` RENAME TO `endpoints`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `endpoints_user_id_idx` ON `endpoints` (`user_id`);