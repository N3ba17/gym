SET FOREIGN_KEY_CHECKS=0;

-- --------------------------------------------------------
-- Table: migrations
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` INT NOT NULL AUTO_INCREMENT, 
  `migration` VARCHAR(255) NOT NULL, 
  `batch` INT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `migrations` VALUES(1,'0001_01_01_000000_create_users_table',1);
INSERT INTO `migrations` VALUES(2,'0001_01_01_000001_create_cache_table',1);
INSERT INTO `migrations` VALUES(3,'0001_01_01_000002_create_jobs_table',1);
INSERT INTO `migrations` VALUES(4,'2025_08_14_170933_add_two_factor_columns_to_users_table',1);
INSERT INTO `migrations` VALUES(5,'2026_05_12_061810_create_registrations_table',1);
INSERT INTO `migrations` VALUES(6,'2026_05_22_061809_create_registration_settings_table',1);
INSERT INTO `migrations` VALUES(7,'2026_05_25_090456_add_capacity_to_registration_settings_table',1);

-- --------------------------------------------------------
-- Table: users
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT, 
  `name` VARCHAR(255) NOT NULL, 
  `email` VARCHAR(255) NOT NULL, 
  `email_verified_at` DATETIME DEFAULT NULL, 
  `password` VARCHAR(255) NOT NULL, 
  `remember_token` VARCHAR(255) DEFAULT NULL, 
  `created_at` DATETIME DEFAULT NULL, 
  `updated_at` DATETIME DEFAULT NULL, 
  `two_factor_secret` TEXT DEFAULT NULL, 
  `two_factor_recovery_codes` TEXT DEFAULT NULL, 
  `two_factor_confirmed_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `users` VALUES(1,'Yemisrach Nigusse','yemisrachn@eeigconstruction.com','2026-05-25 09:41:31','$2y$12$lZ50KtihY2b5nyUwFeReZ.sxoZKS9i196XumgKNp5gCtfllj0u6bi','dot6MftKkJD5aknJdsyD7mrMKMqk4Hn0F5NafiOng3nBM8zSopbw4GcEUnlR','2026-05-25 09:41:31','2026-05-25 09:41:31',NULL,NULL,NULL);

-- --------------------------------------------------------
-- Table: password_reset_tokens
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `email` VARCHAR(255) NOT NULL, 
  `token` VARCHAR(255) NOT NULL, 
  `created_at` DATETIME DEFAULT NULL, 
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: sessions
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` VARCHAR(255) NOT NULL, 
  `user_id` INT DEFAULT NULL, 
  `ip_address` VARCHAR(45) DEFAULT NULL, 
  `user_agent` TEXT DEFAULT NULL, 
  `payload` LONGTEXT NOT NULL, 
  `last_activity` INT NOT NULL, 
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `sessions` VALUES('Z9ZURhuazX0iYsA5Sn4Ysxak72wboUjtSecYPQLR',NULL,'127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','eyJfdG9rZW4iOiJvU1R3NFNlcUZldkJmNjJvT21jMUZncUUwa1ZEWHg1VnpHa1g5NGdvIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC9sb2dpbiIsInJvdXRlIjoibG9naW4ifSwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119fQ==',1779702445);
INSERT INTO `sessions` VALUES('c01F7efBifWjE4kx4POf8IPWl8R4T4PX3QmPic8g',NULL,'127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','eyJfdG9rZW4iOiJDU3RVOUVseUJTWVY1dGJsR3oyOTgxOGRGZmR2MU9Oamk4d01vS2h1IiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC9sb2dpbiIsInJvdXRlIjoibG9naW4ifSwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119fQ==',1779710665);
INSERT INTO `sessions` VALUES('Y1yd3x1uSMGtx1aWJdAlHeU2EEuAiGAwfjgulqWo',1,'127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','eyJfdG9rZW4iOiJCVW5OSGhPcE9IaXNCSjlzaHZwbmRxbVBVVUxDSXFIUkxVTFJ3ajVzIiwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119LCJfcHJldmlvdXMiOnsidXJsIjoiaHR0cDpcL1wvMTI3LjAuMC4xOjgwMDBcL2Rhc2hib2FyZCIsInJvdXRlIjoiZGFzaGJvYXJkIn0sInVybCI6W10sImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjoxfQ==',1779716818);

-- --------------------------------------------------------
-- Table: cache
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cache` (
  `key` VARCHAR(255) NOT NULL, 
  `value` MEDIUMTEXT NOT NULL, 
  `expiration` INT NOT NULL, 
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `cache` VALUES('gymreg-cache-356a192b7913b04c54574d18c28d46e6395428ab:timer','i:1779702212;',1779702212);
INSERT INTO `cache` VALUES('gymreg-cache-356a192b7913b04c54574d18c28d46e6395428ab','i:2;',1779702212);
INSERT INTO `cache` VALUES('gymreg-cache-67c47cb769eb5c6f8a1e68aff54452d4:timer','i:1779710725;',1779710725);
INSERT INTO `cache` VALUES('gymreg-cache-67c47cb769eb5c6f8a1e68aff54452d4','i:1;',1779710725);
INSERT INTO `cache` VALUES('gymreg-cache-info@eecconstruction.com|127.0.0.1:timer','i:1779710725;',1779710725);
INSERT INTO `cache` VALUES('gymreg-cache-info@eecconstruction.com|127.0.0.1','i:1;',1779710725);
INSERT INTO `cache` VALUES('gymreg-cache-ac18d28f30da88468e668ae48588fde0:timer','i:1779711575;',1779711575);
INSERT INTO `cache` VALUES('gymreg-cache-ac18d28f30da88468e668ae48588fde0','i:1;',1779711575);

-- --------------------------------------------------------
-- Table: cache_locks
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cache_locks` (
  `key` VARCHAR(255) NOT NULL, 
  `owner` VARCHAR(255) NOT NULL, 
  `expiration` INT NOT NULL, 
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: jobs
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT, 
  `queue` VARCHAR(255) NOT NULL, 
  `payload` LONGTEXT NOT NULL, 
  `attempts` TINYINT NOT NULL, 
  `reserved_at` INT DEFAULT NULL, 
  `available_at` INT NOT NULL, 
  `created_at` INT NOT NULL, 
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: job_batches
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `job_batches` (
  `id` VARCHAR(255) NOT NULL, 
  `name` VARCHAR(255) NOT NULL, 
  `total_jobs` INT NOT NULL, 
  `pending_jobs` INT NOT NULL, 
  `failed_jobs` INT NOT NULL, 
  `failed_job_ids` LONGTEXT NOT NULL, 
  `options` LONGTEXT, 
  `cancelled_at` INT DEFAULT NULL, 
  `created_at` INT NOT NULL, 
  `finished_at` INT DEFAULT NULL, 
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: failed_jobs
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `failed_jobs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT, 
  `uuid` VARCHAR(255) NOT NULL, 
  `connection` TEXT NOT NULL, 
  `queue` TEXT NOT NULL, 
  `payload` LONGTEXT NOT NULL, 
  `exception` LONGTEXT NOT NULL, 
  `failed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: registrations
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `registrations` (
  `id` INT NOT NULL AUTO_INCREMENT, 
  `name` VARCHAR(255) NOT NULL, 
  `employee_id` VARCHAR(255) NOT NULL, 
  `age` INT NOT NULL, 
  `sex` VARCHAR(45) NOT NULL, 
  `sector` VARCHAR(255) NOT NULL, 
  `phone_number` VARCHAR(45) NOT NULL, 
  `chronic_illness` TEXT DEFAULT NULL, 
  `selected_slots` TEXT NOT NULL, 
  `created_at` DATETIME DEFAULT NULL, 
  `updated_at` DATETIME DEFAULT NULL, 
  PRIMARY KEY (`id`),
  UNIQUE KEY `registrations_employee_id_unique` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `registrations` VALUES(1,'Nebyu Tito','23',33,'Male','Construction','+251921735941',NULL,'{"day":"Monday","time":"12:30 AM - 1:30 AM"},{"day":"Tuesday","time":"1:30 AM - 2:30 AM"},{"day":"Thursday","time":"12:30 AM - 1:30 AM"}','2026-05-25 09:44:58','2026-05-25 12:19:15');
INSERT INTO `registrations` VALUES(2,'Nebyu Tito','65',67,'Male','Construction','+251921735941',NULL,'{"day":"Tuesday","time":"1:30 AM - 2:30 AM"},{"day":"Monday","time":"6:30 AM - 7:30 AM"},{"day":"Wednesday","time":"11:00 AM - 12:00 PM"}','2026-05-25 12:18:53','2026-05-25 12:18:53');

-- --------------------------------------------------------
-- Table: registration_settings
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `registration_settings` (
  `id` INT NOT NULL AUTO_INCREMENT, 
  `is_open` TINYINT(1) NOT NULL DEFAULT 1, 
  `close_at` DATETIME DEFAULT NULL, 
  `open_days` TEXT DEFAULT NULL, 
  `open_from` TIME DEFAULT NULL, 
  `open_to` TIME DEFAULT NULL, 
  `closed_message` VARCHAR(255) DEFAULT NULL, 
  `created_at` DATETIME DEFAULT NULL, 
  `updated_at` DATETIME DEFAULT NULL, 
  `capacity` INT NOT NULL DEFAULT 45, 
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `registration_settings` VALUES(1,1,NULL,NULL,NULL,NULL,NULL,'2026-05-25 09:41:32','2026-05-25 09:41:32',45);

SET FOREIGN_KEY_CHECKS=1;