-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Aug 03, 2023 at 05:14 PM
-- Server version: 10.6.14-MariaDB
-- PHP Version: 8.1.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database: `atlasaiteam_accounts`
--
CREATE DATABASE IF NOT EXISTS `atlasaiteam_accounts` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `atlasaiteam_accounts`;

-- --------------------------------------------------------

--
-- Table structure for table `atlas_users`
--

DROP TABLE IF EXISTS `atlas_users`;
CREATE TABLE `atlas_users` (
  `user_id` int(11) NOT NULL,
  `net_id` varchar(20) NOT NULL,
  `name` varchar(400) NOT NULL,
  `term` varchar(6) DEFAULT NULL,
  `created_by` varchar(20) NOT NULL,
  `created_date` datetime NOT NULL DEFAULT current_timestamp(),
  `last_modified_by` varchar(20) DEFAULT NULL,
  `last_modified_date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='This table hosts all the authorized users of the webapp.';

--
-- Dumping data for table `atlas_users`
--

INSERT INTO `atlas_users` (`user_id`, `net_id`, `name`, `term`, `created_by`, `created_date`, `last_modified_by`, `last_modified_date`) VALUES
(2, 'yse2', 'Yash Ejjagiri', '120235', 'yse2', '2023-07-06 18:42:03', NULL, NULL),
(3, 'msommers', 'Michael Sommers', NULL, 'yse2', '2023-07-14 12:01:09', NULL, NULL);

--
-- Triggers `atlas_users`
--
DROP TRIGGER IF EXISTS `ATLAS_USERS_AUD_TRG_DEL`;
DELIMITER $$
CREATE TRIGGER `ATLAS_USERS_AUD_TRG_DEL` AFTER DELETE ON `atlas_users` FOR EACH ROW BEGIN
   DECLARE operation VARCHAR(10);
   DECLARE audUser VARCHAR(40);
   
   SET operation = 'DELETE';
   SET audUser = NULL;
   SELECT SUBSTRING_INDEX(USER(), '@', 1) INTO audUser;

   INSERT INTO atlas_users_aud (user_id,
       							net_id,
                                name,
                                oid,
                                term,
                                created_by,
                                created_date,
                                last_modified_by,
                                last_modified_date,
                                aud_action,
                                aud_user)
        VALUES (OLD.user_id,
            	OLD.net_id,
				OLD.name,
                OLD.oid,
                OLD.term,
                OLD.CREATED_BY,
                OLD.CREATED_DATE,
                OLD.LAST_MODIFIED_BY,
                OLD.LAST_MODIFIED_DATE,
                operation,
                audUser);
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `ATLAS_USERS_AUD_TRG_UPD`;
DELIMITER $$
CREATE TRIGGER `ATLAS_USERS_AUD_TRG_UPD` AFTER UPDATE ON `atlas_users` FOR EACH ROW BEGIN
   DECLARE operation VARCHAR(10);
   DECLARE audUser VARCHAR(40);
   
   SET operation = 'UPDATE';
   SET audUser = NULL;
   
   IF NEW.LAST_MODIFIED_BY IS NOT NULL
   THEN
      SET audUser = NEW.LAST_MODIFIED_BY;
   ELSE
      SELECT SUBSTRING_INDEX(USER(), '@', 1) INTO audUser;
   END IF;

   INSERT INTO atlas_users_aud (user_id,
       							net_id,
                                name,
                                oid,
                                term,
                                created_by,
                                created_date,
                                last_modified_by,
                                last_modified_date,
                                aud_action,
                                aud_user)
        VALUES (OLD.user_id,
            	OLD.net_id,
				OLD.name,
                OLD.oid,
                OLD.term,
                OLD.CREATED_BY,
                OLD.CREATED_DATE,
                OLD.LAST_MODIFIED_BY,
                OLD.LAST_MODIFIED_DATE,
                operation,
                audUser);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `intern_paragraphs`
--

DROP TABLE IF EXISTS `intern_paragraphs`;
CREATE TABLE `intern_paragraphs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `term` varchar(6) NOT NULL,
  `paragraph` text NOT NULL,
  `created_by` varchar(20) NOT NULL,
  `created_date` datetime NOT NULL DEFAULT current_timestamp(),
  `last_modified_by` varchar(20) DEFAULT NULL,
  `last_modified_date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `intern_paragraphs`
--

INSERT INTO `intern_paragraphs` (`id`, `user_id`, `term`, `paragraph`, `created_by`, `created_date`, `last_modified_by`, `last_modified_date`) VALUES
(2, 2, '120235', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Magna etiam tempor orci eu. Sit amet nulla facilisi morbi tempus iaculis urna id. Commodo odio aenean sed adipiscing. Sed sed risus pretium quam vulputate dignissim suspendisse in. Et malesuada fames ac turpis egestas. Sit amet consectetur adipiscing elit duis tristique sollicitudin. Auctor neque vitae tempus quam pellentesque nec nam aliquam. In fermentum et sollicitudin ac orci phasellus egestas tellus. Cum sociis natoque penatibus et magnis dis. Quis viverra nibh cras pulvinar mattis nunc sed blandit libero. Pretium nibh ipsum consequat nisl vel. Nunc sed velit dignissim sodales ut eu sem integer. In mollis nunc sed id semper risus in hendrerit gravida. Mauris pharetra et ultrices neque ornare aenean euismod. Massa ultricies mi quis hendrerit dolor magna eget est. Pharetra magna ac placerat vestibulum.', 'yse2', '2023-07-09 09:57:22', NULL, NULL);

--
-- Triggers `intern_paragraphs`
--
DROP TRIGGER IF EXISTS `INTERN_PG_AUD_TRG_DEL`;
DELIMITER $$
CREATE TRIGGER `INTERN_PG_AUD_TRG_DEL` AFTER DELETE ON `intern_paragraphs` FOR EACH ROW BEGIN
   DECLARE operation VARCHAR(10);
   DECLARE audUser VARCHAR(40);
   
   SET operation = 'DELETE';
   SET audUser = NULL;
   SELECT SUBSTRING_INDEX(USER(), '@', 1) INTO audUser;

   INSERT INTO intern_paragraphs_aud (id,
                                user_id,
                                term,
                                paragraph,
                                created_by,
                                created_date,
                                last_modified_by,
                                last_modified_date,
                                aud_action,
                                aud_user)
        VALUES (OLD.id,
            	OLD.user_id,
				OLD.term,
                OLD.paragraph,
                OLD.CREATED_BY,
                OLD.CREATED_DATE,
                OLD.LAST_MODIFIED_BY,
                OLD.LAST_MODIFIED_DATE,
                operation,
                audUser);
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `INTERN_PG_AUD_TRG_UPD`;
DELIMITER $$
CREATE TRIGGER `INTERN_PG_AUD_TRG_UPD` AFTER UPDATE ON `intern_paragraphs` FOR EACH ROW BEGIN
   DECLARE operation VARCHAR(10);
   DECLARE audUser VARCHAR(40);
   
   SET operation = 'UPDATE';
   SET audUser = NULL;
   
   IF NEW.LAST_MODIFIED_BY IS NOT NULL
   THEN
      SET audUser = NEW.LAST_MODIFIED_BY;
   ELSE
      SELECT SUBSTRING_INDEX(USER(), '@', 1) INTO audUser;
   END IF;

   INSERT INTO intern_paragraphs_aud (id,
       							user_id,
                                term,
                                paragraph,
                                created_by,
                                created_date,
                                last_modified_by,
                                last_modified_date,
                                aud_action,
                                aud_user)
        VALUES (OLD.id,
            	OLD.user_id,
				OLD.term,
                OLD.paragraph,
                OLD.CREATED_BY,
                OLD.CREATED_DATE,
                OLD.LAST_MODIFIED_BY,
                OLD.LAST_MODIFIED_DATE,
                operation,
                audUser);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `user_actions`
--

DROP TABLE IF EXISTS `user_actions`;
CREATE TABLE `user_actions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `spotlight_attempts` int(11) NOT NULL DEFAULT 3,
  `message_attempts` int(11) NOT NULL DEFAULT 3,
  `created_by` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_date` datetime NOT NULL DEFAULT current_timestamp(),
  `last_modified_by` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_modified_date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci COMMENT='Stores the num of attempts allowed for generated text';

--
-- Dumping data for table `user_actions`
--

INSERT INTO `user_actions` (`id`, `user_id`, `spotlight_attempts`, `message_attempts`, `created_by`, `created_date`, `last_modified_by`, `last_modified_date`) VALUES
(2, 2, 3, 3, 'yse2', '2023-07-09 09:53:34', NULL, NULL),
(4, 3, 3, 3, 'yse2', '2023-07-14 12:04:12', NULL, NULL);

--
-- Triggers `user_actions`
--
DROP TRIGGER IF EXISTS `USER_ACTIONS_AUD_TRG_DEL`;
DELIMITER $$
CREATE TRIGGER `USER_ACTIONS_AUD_TRG_DEL` AFTER DELETE ON `user_actions` FOR EACH ROW BEGIN
   DECLARE operation VARCHAR(10);
   DECLARE audUser VARCHAR(40);
   
   SET operation = 'DELETE';
   SET audUser = NULL;
   SELECT SUBSTRING_INDEX(USER(), '@', 1) INTO audUser;


   INSERT INTO user_actions_aud (id,
                                user_id,
                                spotlight_attempts,
                                message_attempts,
                                created_by,
                                created_date,
                                last_modified_by,
                                last_modified_date,
                                aud_action,
                                aud_user)
        VALUES (OLD.id,
            	OLD.user_id,
				OLD.spotlight_attempts,
                OLD.message_attempts,
                OLD.CREATED_BY,
                OLD.CREATED_DATE,
                OLD.LAST_MODIFIED_BY,
                OLD.LAST_MODIFIED_DATE,
                operation,
                audUser);
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `USER_ACTIONS_AUD_TRG_UPD`;
DELIMITER $$
CREATE TRIGGER `USER_ACTIONS_AUD_TRG_UPD` AFTER UPDATE ON `user_actions` FOR EACH ROW BEGIN
   DECLARE operation VARCHAR(10);
   DECLARE audUser VARCHAR(40);
   
   SET operation = 'UPDATE';
   SET audUser = NULL;
   
   IF NEW.LAST_MODIFIED_BY IS NOT NULL
   THEN
      SET audUser = NEW.LAST_MODIFIED_BY;
   ELSE
      SELECT SUBSTRING_INDEX(USER(), '@', 1) INTO audUser;
   END IF;

   INSERT INTO user_actions_aud (id,
       							user_id,
                                spotlight_attempts,
                                message_attempts,
                                created_by,
                                created_date,
                                last_modified_by,
                                last_modified_date,
                                aud_action,
                                aud_user)
        VALUES (OLD.id,
            	OLD.user_id,
				OLD.spotlight_attempts,
                OLD.message_attempts,
                OLD.CREATED_BY,
                OLD.CREATED_DATE,
                OLD.LAST_MODIFIED_BY,
                OLD.LAST_MODIFIED_DATE,
                operation,
                audUser);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_date` datetime NOT NULL DEFAULT current_timestamp(),
  `last_modified_by` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_modified_date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci COMMENT='This table holds the role(s) of each user';

--
-- Dumping data for table `user_roles`
--

INSERT INTO `user_roles` (`id`, `user_id`, `role`, `created_by`, `created_date`, `last_modified_by`, `last_modified_date`) VALUES
(1, 2, 'Intern', 'yse2', '2023-07-09 09:55:42', NULL, NULL),
(2, 2, 'Staff', 'yse2', '2023-07-09 09:55:42', NULL, NULL),
(3, 2, 'Admin', 'yse2', '2023-07-09 09:55:42', NULL, NULL),
(4, 3, 'Staff', 'yse2', '2023-07-14 12:06:54', NULL, NULL),
(5, 3, 'Admin', 'yse2', '2023-07-14 12:06:54', NULL, NULL);

--
-- Triggers `user_roles`
--
DROP TRIGGER IF EXISTS `USER_ROLES_AUD_TRG_DEL`;
DELIMITER $$
CREATE TRIGGER `USER_ROLES_AUD_TRG_DEL` AFTER DELETE ON `user_roles` FOR EACH ROW BEGIN
   DECLARE operation VARCHAR(10);
   DECLARE audUser VARCHAR(40);
   
   SET operation = 'DELETE';
   SET audUser = NULL;
   SELECT SUBSTRING_INDEX(USER(), '@', 1) INTO audUser;

   INSERT INTO user_roles_aud (id,
       							user_id,
                                role,
                                created_by,
                                created_date,
                                last_modified_by,
                                last_modified_date,
                                aud_action,
                                aud_user)
        VALUES (OLD.id,
            	OLD.user_id,
				OLD.role,
                OLD.CREATED_BY,
                OLD.CREATED_DATE,
                OLD.LAST_MODIFIED_BY,
                OLD.LAST_MODIFIED_DATE,
                operation,
                audUser);
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `USER_ROLES_AUD_TRG_UPD`;
DELIMITER $$
CREATE TRIGGER `USER_ROLES_AUD_TRG_UPD` AFTER UPDATE ON `user_roles` FOR EACH ROW BEGIN
   DECLARE operation VARCHAR(10);
   DECLARE audUser VARCHAR(40);
   
   SET operation = 'UPDATE';
   SET audUser = NULL;
   
   IF NEW.LAST_MODIFIED_BY IS NOT NULL
   THEN
      SET audUser = NEW.LAST_MODIFIED_BY;
   ELSE
      SELECT SUBSTRING_INDEX(USER(), '@', 1) INTO audUser;
   END IF;

   INSERT INTO user_roles_aud (id,
       							user_id,
                                role,
                                created_by,
                                created_date,
                                last_modified_by,
                                last_modified_date,
                                aud_action,
                                aud_user)
        VALUES (OLD.id,
            	OLD.user_id,
				OLD.role,
                OLD.CREATED_BY,
                OLD.CREATED_DATE,
                OLD.LAST_MODIFIED_BY,
                OLD.LAST_MODIFIED_DATE,
                operation,
                audUser);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `user_roles_lkup`
--

DROP TABLE IF EXISTS `user_roles_lkup`;
CREATE TABLE `user_roles_lkup` (
  `role` varchar(20) NOT NULL,
  `description` text NOT NULL,
  `created_by` varchar(20) NOT NULL,
  `created_date` datetime NOT NULL DEFAULT current_timestamp(),
  `last_modified_by` varchar(20) DEFAULT NULL,
  `last_modified_date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_roles_lkup`
--

INSERT INTO `user_roles_lkup` (`role`, `description`, `created_by`, `created_date`, `last_modified_by`, `last_modified_date`) VALUES
('Admin', 'This role is for the admin of the ATLAS Internship Program. They have all the privileges of Staff and are also able to add, edit, and delete staff users.', 'yse2', '2023-07-05 11:08:43', 'yse2', '2023-07-05 12:10:11'),
('Intern', 'This role is for current ATLAS Interns in the Internship program. They have access to submit their details for a generated paragraph and view their own paragraphs. Once the current term is over, they will no longer be have this role.', 'yse2', '2023-07-05 11:08:43', NULL, NULL),
('Staff', 'This role is for the staff of the ATLAS Internship Program. They have access to all the student paragraphs and all the interns\' information such as their name, term, number of attempts for each form, etc. They are allowed to add, edit and delete interns.', 'yse2', '2023-07-05 11:08:43', NULL, NULL);

--
-- Triggers `user_roles_lkup`
--
DROP TRIGGER IF EXISTS `USER_ROLES_LKUP_AUD_TRG_DEL`;
DELIMITER $$
CREATE TRIGGER `USER_ROLES_LKUP_AUD_TRG_DEL` AFTER DELETE ON `user_roles_lkup` FOR EACH ROW BEGIN
   DECLARE operation VARCHAR(10);
   DECLARE audUser VARCHAR(40);
   
   SET operation = 'DELETE';
   SET audUser = NULL;
   SELECT SUBSTRING_INDEX(USER(), '@', 1) INTO audUser;

   INSERT INTO user_roles_lkup_aud (role,
                                description,
                                created_by,
                                created_date,
                                last_modified_by,
                                last_modified_date,
                                aud_action,
                                aud_user)
        VALUES (OLD.role,
				OLD.description,
                OLD.CREATED_BY,
                OLD.CREATED_DATE,
                OLD.LAST_MODIFIED_BY,
                OLD.LAST_MODIFIED_DATE,
                operation,
                audUser);
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `USER_ROLES_LKUP_AUD_TRG_UPD`;
DELIMITER $$
CREATE TRIGGER `USER_ROLES_LKUP_AUD_TRG_UPD` AFTER UPDATE ON `user_roles_lkup` FOR EACH ROW BEGIN
   DECLARE operation VARCHAR(10);
   DECLARE audUser VARCHAR(40);
   
   SET operation = 'UPDATE';
   SET audUser = NULL;
   
   IF NEW.LAST_MODIFIED_BY IS NOT NULL
   THEN
      SET audUser = NEW.LAST_MODIFIED_BY;
   ELSE
      SELECT SUBSTRING_INDEX(USER(), '@', 1) INTO audUser;
   END IF;

   INSERT INTO user_roles_lkup_aud (role,
                                description,
                                created_by,
                                created_date,
                                last_modified_by,
                                last_modified_date,
                                aud_action,
                                aud_user)
        VALUES (OLD.role,
				OLD.description,
                OLD.CREATED_BY,
                OLD.CREATED_DATE,
                OLD.LAST_MODIFIED_BY,
                OLD.LAST_MODIFIED_DATE,
                operation,
                audUser);
END
$$
DELIMITER ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `atlas_users`
--
ALTER TABLE `atlas_users`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `intern_paragraphs`
--
ALTER TABLE `intern_paragraphs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `paragraphs_user_id_constraint` (`user_id`);

--
-- Indexes for table `user_actions`
--
ALTER TABLE `user_actions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `actions_user_id_constraint` (`user_id`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `role_constraint` (`role`),
  ADD KEY `roles_user_id_constraint` (`user_id`);

--
-- Indexes for table `user_roles_lkup`
--
ALTER TABLE `user_roles_lkup`
  ADD PRIMARY KEY (`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `atlas_users`
--
ALTER TABLE `atlas_users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `intern_paragraphs`
--
ALTER TABLE `intern_paragraphs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user_actions`
--
ALTER TABLE `user_actions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `user_roles`
--
ALTER TABLE `user_roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `intern_paragraphs`
--
ALTER TABLE `intern_paragraphs`
  ADD CONSTRAINT `intern_paragraphs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `atlas_users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_actions`
--
ALTER TABLE `user_actions`
  ADD CONSTRAINT `actions_user_id_constraint` FOREIGN KEY (`user_id`) REFERENCES `atlas_users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `role_constraint` FOREIGN KEY (`role`) REFERENCES `user_roles_lkup` (`role`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `roles_user_id_constraint` FOREIGN KEY (`user_id`) REFERENCES `atlas_users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;
