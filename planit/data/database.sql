CREATE DATABASE planit;

CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `user_login` varchar(45) CHARACTER SET utf8mb3 COLLATE utf8mb3_polish_ci NOT NULL,
  `user_password` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_polish_ci NOT NULL,
  `user_email` varchar(45) CHARACTER SET utf8mb3 COLLATE utf8mb3_polish_ci NOT NULL,
  `user_name` varchar(45) NOT NULL,
  `user_surname` varchar(45) CHARACTER SET utf8mb3 COLLATE utf8mb3_polish_ci NOT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3

CREATE TABLE `tasks` (
  `task_id` int NOT NULL AUTO_INCREMENT,
  `task_name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_polish_ci NOT NULL,
  `task_user_id` int NOT NULL,
  `task_more` varchar(1000) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `task_group` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_polish_ci DEFAULT NULL,
  `task_end_time` time DEFAULT NULL,
  `task_end_date` date DEFAULT NULL,
  `task_completed` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`task_id`),
  KEY `fk_task_user_id` (`task_user_id`),
  CONSTRAINT `fk_task_user_id` FOREIGN KEY (`task_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb3