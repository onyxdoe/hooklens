CREATE TABLE `endpoints` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`forward_enabled` integer DEFAULT false NOT NULL,
	`forward_url` text
);
--> statement-breakpoint
CREATE TABLE `requests` (
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
	FOREIGN KEY (`endpoint_id`) REFERENCES `endpoints`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `requests_endpoint_id_idx` ON `requests` (`endpoint_id`);--> statement-breakpoint
CREATE INDEX `requests_created_at_idx` ON `requests` (`created_at`);