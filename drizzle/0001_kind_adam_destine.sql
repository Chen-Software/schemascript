PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_artefacts` (
	`name` text NOT NULL,
	`timestamp` integer DEFAULT 'now' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_artefacts`("name", "timestamp") SELECT "name", "timestamp" FROM `artefacts`;--> statement-breakpoint
DROP TABLE `artefacts`;--> statement-breakpoint
ALTER TABLE `__new_artefacts` RENAME TO `artefacts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;