CREATE TABLE `attendees` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`cpf` text NOT NULL,
	`email` text NOT NULL,
	`event_type` text NOT NULL,
	`guest_count` integer NOT NULL,
	`event_location` text NOT NULL,
	`event_date` text NOT NULL,
	`requested_service` text NOT NULL,
	`partner_code` text,
	`access_code` text NOT NULL,
	`consent_at` text NOT NULL,
	`checked_in_at` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attendees_access_code_unique` ON `attendees` (`access_code`);--> statement-breakpoint
CREATE TABLE `partners` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`business_name` text NOT NULL,
	`email` text NOT NULL,
	`whatsapp` text,
	`service_type` text NOT NULL,
	`instagram` text,
	`share_code` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `partners_share_code_unique` ON `partners` (`share_code`);
