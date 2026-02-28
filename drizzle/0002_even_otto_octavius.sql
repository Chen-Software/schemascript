ALTER TABLE `artefacts` RENAME COLUMN "name" TO "pathname";--> statement-breakpoint
ALTER TABLE `artefacts` RENAME COLUMN "timestamp" TO "created_at";--> statement-breakpoint
ALTER TABLE `artefacts` ADD `digest` text NOT NULL;--> statement-breakpoint
ALTER TABLE `artefacts` ADD `modified_at` integer DEFAULT 'now' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `artefacts_pathname_unique` ON `artefacts` (`pathname`);--> statement-breakpoint
CREATE UNIQUE INDEX `artefacts_digest_unique` ON `artefacts` (`digest`);